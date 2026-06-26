import { NextFunction, Request, Response } from 'express'
import { LoggedInUser } from '../enterprise/Interface.Enterprise'

// Used when ACCELANCE_ENGINE_MODE=true.
// Context can come from two sources:
//   1. NestJS proxy headers (x-workspace-id etc.) — for API calls routed through NestJS
//   2. accel_ctx cookie — for browser-direct canvas sessions (set by canvasBootstrap)
export const trustEngineHeaders = (req: Request, res: Response, next: NextFunction) => {
    let workspaceId = req.headers['x-workspace-id'] as string
    let tenantId = req.headers['x-tenant-id'] as string
    let userId = req.headers['x-user-id'] as string
    let userRole = req.headers['x-user-role'] as string

    // Fallback: read workspace context from the accel_ctx cookie (set by canvasBootstrap)
    if ((!workspaceId || !tenantId) && (req as any).cookies?.accel_ctx) {
        try {
            const ctx = JSON.parse(Buffer.from((req as any).cookies.accel_ctx, 'base64').toString('utf8'))
            workspaceId = workspaceId || ctx.workspaceId
            tenantId = tenantId || ctx.tenantId
            userId = userId || ctx.userId
            userRole = userRole || ctx.role
        } catch {
            // malformed cookie — fall through to the missing-headers error below
        }
    }

    if (!workspaceId || !tenantId) {
        return res.status(401).json({ error: 'Missing engine context headers (x-workspace-id, x-tenant-id)' })
    }

    // isOrganizationAdmin=true bypasses all checkPermission / checkAnyPermission guards.
    // The NestJS API already enforced the user's actual RBAC before proxying here.
    ;(req as any).user = {
        id: userId || '',
        email: '',
        name: '',
        roleId: userRole || '',
        activeOrganizationId: tenantId,
        activeOrganizationSubscriptionId: '',
        activeOrganizationCustomerId: '',
        activeOrganizationProductId: '',
        isOrganizationAdmin: true,
        activeWorkspaceId: workspaceId,
        activeWorkspace: '',
        assignedWorkspaces: [],
        permissions: ['*'],
        features: {}
    } satisfies LoggedInUser

    next()
}
