from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_admin
from app.crud.crud_agent import crud_agent
from app.schemas.agent import Agent, AgentCreate, AgentUpdate
from app.api.utils import serialize_model_list, serialize_model

router = APIRouter()


@router.get("/")
def list_agents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin),
):
    """List all agents."""
    agents = crud_agent.get_multi(db, skip=skip, limit=limit)
    return serialize_model_list(agents)


@router.post("/", response_model=Agent)
def create_agent(
    agent_in: AgentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Create a new agent."""
    return crud_agent.create(db, obj_in=agent_in)


@router.get("/{agent_id}", response_model=Agent)
def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Get agent by ID."""
    agent = crud_agent.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=Agent)
def update_agent(
    agent_id: str,
    agent_in: AgentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Update an agent."""
    agent = crud_agent.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return crud_agent.update(db, db_obj=agent, obj_in=agent_in)


@router.delete("/{agent_id}")
def delete_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Delete an agent."""
    agent = crud_agent.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    crud_agent.remove(db, id=agent_id)
    return {"message": "Agent deleted"}

