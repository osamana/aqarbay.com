from app.crud.base import CRUDBase
from app.db.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate


class CRUDLead(CRUDBase[Lead, LeadCreate, LeadUpdate]):
    pass


crud_lead = CRUDLead(Lead)

