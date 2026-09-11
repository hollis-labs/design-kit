/**
 * The escape hatch has to be legible, or it is just a hole.
 *
 * The task asked for "a documented escape hatch with a required reason comment,
 * so a genuine one-off is legible rather than invisible". ESLint already supports
 * a description after `--` in a disable directive; nothing enforces it. A bare
 * `// eslint-disable-next-line design/no-arbitrary-scale` is indistinguishable
 * from someone silencing a rule they disagreed with, and it survives review the
 * same way the four invented token names did.
 *
 * This rule only governs disables of THIS plugin's rules. It has no opinion about
 * anyone else's.
 */
const DIRECTIVE = /^\s*eslint-disable(?:-next-line|-line)?\s+([^]*)$/

export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disabling a design rule requires a reason.' },
    schema: [{
      type: 'object',
      properties: { pluginName: { type: 'string' } },
      additionalProperties: false,
    }],
    messages: {
      needReason: 'Disabling {{rules}} requires a reason: add " -- why" to the directive. A silent disable is indistinguishable from someone silencing a rule they disagreed with.',
    },
  },
  create(context) {
    const { pluginName = 'design' } = context.options[0] ?? {}
    const sourceCode = context.sourceCode

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          const m = DIRECTIVE.exec(comment.value)
          if (!m) continue
          const body = m[1]
          // Everything before ` -- ` is the rule list; after it is the reason.
          const [rulePart, ...reasonParts] = body.split(/\s--\s/)
          const rules = rulePart
            .split(',')
            .map((r) => r.trim())
            .filter((r) => r.startsWith(pluginName + '/'))
          if (rules.length === 0) continue
          const reason = reasonParts.join(' -- ').trim()
          if (reason.length > 0) continue
          context.report({ node: comment, messageId: 'needReason', data: { rules: rules.join(', ') } })
        }
      },
    }
  },
}
