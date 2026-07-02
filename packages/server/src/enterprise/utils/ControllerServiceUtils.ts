import { Equal } from 'typeorm'
import { Request } from 'express'
import { InternalAccelanceError } from '../../errors/internalAccelanceError'
import { StatusCodes } from 'http-status-codes'

export const getWorkspaceSearchOptions = (workspaceId?: string) => {
    if (!workspaceId) {
        throw new InternalAccelanceError(StatusCodes.BAD_REQUEST, `Workspace ID is required`)
    }
    return { workspaceId: Equal(workspaceId) }
}

export const getWorkspaceSearchOptionsFromReq = (req: Request) => {
    const workspaceId = req.user?.activeWorkspaceId
    if (!workspaceId) {
        throw new InternalAccelanceError(StatusCodes.BAD_REQUEST, `Workspace ID is required`)
    }
    return { workspaceId: Equal(workspaceId) }
}
