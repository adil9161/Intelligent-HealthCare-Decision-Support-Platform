"""Initial schema migration for AegisHealth AI

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-29 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='staff'),
        sa.Column('department', sa.String(), nullable=True, server_default='General Medicine'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Patients Table
    op.create_table(
        'patients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(), nullable=True),
        sa.Column('contact', sa.String(), nullable=True),
        sa.Column('symptoms', sa.JSON(), nullable=False),
        sa.Column('severity', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('urgency', sa.String(), nullable=False, server_default='Urgent'),
        sa.Column('disease', sa.String(), nullable=True),
        sa.Column('assigned_department', sa.String(), nullable=False, server_default='Emergency'),
        sa.Column('status', sa.String(), nullable=False, server_default='Waiting'),
        sa.Column('bed_number', sa.String(), nullable=True),
        sa.Column('assigned_doctor', sa.String(), nullable=True),
        sa.Column('vitals', sa.JSON(), nullable=True),
        sa.Column('ai_recommendation', sa.JSON(), nullable=True),
        sa.Column('triage_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patients_id'), 'patients', ['id'], unique=False)
    op.create_index(op.f('ix_patients_name'), 'patients', ['name'], unique=False)
    op.create_index(op.f('ix_patients_patient_id'), 'patients', ['patient_id'], unique=True)

    # Staff Table
    op.create_table(
        'staff',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('staff_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('department', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('salary', sa.Float(), nullable=False, server_default='75000.0'),
        sa.Column('attendance', sa.String(), nullable=False, server_default='Present'),
        sa.Column('availability', sa.String(), nullable=False, server_default='Available'),
        sa.Column('shift', sa.String(), nullable=True, server_default='Morning'),
        sa.Column('current_patient_load', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('qualification', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_staff_department'), 'staff', ['department'], unique=False)
    op.create_index(op.f('ix_staff_id'), 'staff', ['id'], unique=False)
    op.create_index(op.f('ix_staff_name'), 'staff', ['name'], unique=False)
    op.create_index(op.f('ix_staff_staff_id'), 'staff', ['staff_id'], unique=True)

    # Resources Table
    op.create_table(
        'resources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('resource_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('department', sa.String(), nullable=False),
        sa.Column('total_capacity', sa.Float(), nullable=False),
        sa.Column('available_units', sa.Float(), nullable=False),
        sa.Column('occupied_units', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('unit_measure', sa.String(), nullable=False, server_default='units'),
        sa.Column('burn_rate_per_hour', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('min_safety_threshold', sa.Float(), nullable=True, server_default='10.0'),
        sa.Column('status', sa.String(), nullable=True, server_default='Normal'),
        sa.Column('predicted_exhaustion_hours', sa.Float(), nullable=True),
        sa.Column('last_restocked', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resources_category'), 'resources', ['category'], unique=False)
    op.create_index(op.f('ix_resources_id'), 'resources', ['id'], unique=False)
    op.create_index(op.f('ix_resources_name'), 'resources', ['name'], unique=False)
    op.create_index(op.f('ix_resources_resource_id'), 'resources', ['resource_id'], unique=True)

    # Audit Logs Table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('actor_email', sa.String(), nullable=False),
        sa.Column('actor_name', sa.String(), nullable=False),
        sa.Column('actor_role', sa.String(), nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_timestamp'), 'audit_logs', ['timestamp'], unique=False)

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('resources')
    op.drop_table('staff')
    op.drop_table('patients')
    op.drop_table('users')
