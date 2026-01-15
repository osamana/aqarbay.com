from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db, get_current_admin
from app.crud.crud_lead import crud_lead
from app.schemas.lead import Lead, LeadUpdate
from app.api.utils import serialize_model_list, serialize_model
import csv
import io

router = APIRouter()


@router.get("/")
def list_leads(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin),
):
    """List all leads."""
    leads = crud_lead.get_multi(db, skip=skip, limit=limit)
    return serialize_model_list(leads)


@router.get("/{lead_id}", response_model=Lead)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Get lead by ID."""
    lead = crud_lead.get(db, id=lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=Lead)
def update_lead(
    lead_id: str,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Update lead status."""
    lead = crud_lead.get(db, id=lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return crud_lead.update(db, db_obj=lead, obj_in=lead_in)


@router.delete("/{lead_id}")
def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Delete a lead."""
    lead = crud_lead.get(db, id=lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    crud_lead.remove(db, id=lead_id)
    return {"message": "Lead deleted"}


@router.get("/export/csv")
def export_leads_csv(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
    status: Optional[str] = Query(None),
):
    """Export leads to CSV."""
    leads = crud_lead.get_multi(db, skip=0, limit=10000)
    
    # Filter by status if provided
    if status:
        leads = [lead for lead in leads if lead.status.value == status]
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Name", "Phone", "Email", "Message", "Status",
        "Property", "Created At"
    ])
    
    # Write data
    for lead in leads:
        writer.writerow([
            str(lead.id),
            lead.name,
            lead.phone,
            lead.email or "",
            lead.message or "",
            lead.status.value,
            lead.property.title_en if lead.property else "",
            lead.created_at.isoformat(),
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=leads_export.csv"
        }
    )

