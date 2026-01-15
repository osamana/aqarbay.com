"""add_property_pois_table

Revision ID: add_property_pois
Revises: eb48d0dfd5e0
Create Date: 2026-01-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_property_pois'
down_revision = 'eb48d0dfd5e0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('property_pois',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=False),
    sa.Column('name', sa.String(length=500), nullable=False),
    sa.Column('name_en', sa.String(length=500), nullable=True),
    sa.Column('name_ar', sa.String(length=500), nullable=True),
    sa.Column('lat', sa.Numeric(precision=10, scale=8), nullable=False),
    sa.Column('lng', sa.Numeric(precision=11, scale=8), nullable=False),
    sa.Column('distance', sa.Numeric(precision=10, scale=1), nullable=False),
    sa.Column('poi_type', sa.String(length=100), nullable=True),
    sa.Column('address', sa.String(length=500), nullable=True),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_property_pois_property_id'), 'property_pois', ['property_id'], unique=False)
    op.create_index(op.f('ix_property_pois_category'), 'property_pois', ['category'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_property_pois_category'), table_name='property_pois')
    op.drop_index(op.f('ix_property_pois_property_id'), table_name='property_pois')
    op.drop_table('property_pois')

