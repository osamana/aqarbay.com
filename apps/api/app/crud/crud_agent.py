from app.crud.base import CRUDBase
from app.db.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate


class CRUDAgent(CRUDBase[Agent, AgentCreate, AgentUpdate]):
    pass


crud_agent = CRUDAgent(Agent)

