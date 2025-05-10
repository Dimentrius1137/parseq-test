export type ListType = { 
        name: string, 
        mutations?: string[]
    };

export type MutationType = {
    mutationId: string
    mutationType: string
    maybeHgvsGdna: string
    therapeuticAnnotations: { evidenceLevel: string }[]
    prognosticAnnotations: { evidenceLevel: string }[]
    lowTierAnnotations: { evidenceLevel: string }[]
    acmgAnnotations: { acmgSignificances: string }[]
}