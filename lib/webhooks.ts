import { createClient } from '@/lib/supabase/server'

interface WebhookPayload {
    userName: string
    moduleTitle: string
    score: number
    orgName?: string
}

function buildSlackMessage(payload: WebhookPayload): object {
    return {
        text: `✅ *${payload.userName}* completed *${payload.moduleTitle}* with a score of *${payload.score}%*${payload.orgName ? ` — ${payload.orgName}` : ''}`,
    }
}

function buildTeamsMessage(payload: WebhookPayload): object {
    return {
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: {
                    type: 'AdaptiveCard',
                    version: '1.4',
                    body: [
                        {
                            type: 'TextBlock',
                            text: '✅ Training Completed',
                            weight: 'Bolder',
                            size: 'Medium',
                            color: 'Good',
                        },
                        {
                            type: 'FactSet',
                            facts: [
                                { title: 'Employee', value: payload.userName },
                                { title: 'Module', value: payload.moduleTitle },
                                { title: 'Score', value: `${payload.score}%` },
                                ...(payload.orgName ? [{ title: 'Organization', value: payload.orgName }] : []),
                            ],
                        },
                    ],
                },
            },
        ],
    }
}

export async function notifyWebhooks(payload: WebhookPayload, organizationId: string) {
    const supabase = await createClient()

    const { data: org } = await supabase
        .from('organizations')
        .select('slack_webhook_url, teams_webhook_url, display_name')
        .eq('id', organizationId)
        .single()

    if (!org) return

    const enriched = { ...payload, orgName: org.display_name || payload.orgName }
    const promises: Promise<any>[] = []

    if (org.slack_webhook_url) {
        promises.push(
            fetch(org.slack_webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildSlackMessage(enriched)),
            }).catch(err => console.error('Slack webhook failed:', err))
        )
    }

    if (org.teams_webhook_url) {
        promises.push(
            fetch(org.teams_webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildTeamsMessage(enriched)),
            }).catch(err => console.error('Teams webhook failed:', err))
        )
    }

    await Promise.all(promises)
}
