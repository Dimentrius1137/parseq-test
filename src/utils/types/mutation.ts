export type MutationType = {
    isAdded: boolean
    mutationId: string
    mutationType: string
    maybeHgvsGdna: string
    therapeuticAnnotations: { evidenceLevel: string }[]
    prognosticAnnotations: { evidenceLevel: string }[]
    lowTierAnnotations: { evidenceLevel: string }[]
    acmgAnnotations: { acmgSignificances: string }[]
}