# AI Assistant Configuration Consolidation

## Summary

All AI assistant configuration files have been consolidated into a single source of truth: **`AGENTS.md`** at the repository root.

## Changes Made

### 1. Updated AGENTS.md
- Brought content to full parity with `.github/copilot-instructions.md`
- Added comprehensive project overview
- Included complete command reference
- Added detailed code style guidelines
- Maintained manual additions section for custom instructions

### 2. Updated Update Script
File: `.specify/scripts/bash/update-agent-context.sh`

Changes:
- Redirected `COPILOT_FILE` to point to `AGENTS.md`
- Redirected `CURSOR_FILE` to point to `AGENTS.md`
- Added legacy file path variables for backward compatibility checking
- Updated default file creation to use `AGENTS.md` instead of `CLAUDE.md`
- Updated documentation to reflect consolidation
- Modified `update_all_existing_agents()` to check for legacy files but update `AGENTS.md`

### 3. Deprecated Legacy Files
- Added deprecation notice to `.github/copilot-instructions.md`
- Legacy file remains for reference but is no longer actively maintained
- Created `COPILOT_MIGRATION.md` to document the migration

### 4. Updated Documentation
- Added "AI Assistant Guidelines" section to README.md
- Documented the consolidated approach

## Agent Support

The following AI assistants now use `AGENTS.md`:
- ✅ GitHub Copilot (consolidated)
- ✅ Cursor IDE (consolidated)
- ✅ Codex CLI (already used AGENTS.md)
- ✅ opencode (already used AGENTS.md)
- ✅ Amazon Q Developer CLI (already used AGENTS.md)

The following agents maintain separate files:
- Claude Code → `CLAUDE.md`
- Gemini CLI → `GEMINI.md`
- Qwen Code → `QWEN.md`
- Windsurf → `.windsurf/rules/specify-rules.md`
- Kilo Code → `.kilocode/rules/specify-rules.md`
- Auggie CLI → `.augment/rules/specify-rules.md`
- Roo Code → `.roo/rules/specify-rules.md`

Note: Additional agents can be consolidated into `AGENTS.md` in the future if desired.

## Benefits

1. **Single Source of Truth**: All common guidelines maintained in one place
2. **Consistency**: Ensures all AI assistants see the same project guidelines
3. **Easier Maintenance**: Update once, applies to multiple tools
4. **Reduced Redundancy**: Eliminates duplicate content across files
5. **Clear Migration Path**: Legacy files marked as deprecated with clear guidance

## Usage

### For Developers
No action required. AI assistants will automatically use the consolidated file.

### For Script Users
When running `update-agent-context.sh`:
- `./update-agent-context.sh copilot` - Updates `AGENTS.md`
- `./update-agent-context.sh cursor` - Updates `AGENTS.md`
- `./update-agent-context.sh` - Updates all existing agent files, including `AGENTS.md` if legacy files exist

### For Manual Updates
Edit `AGENTS.md` directly. The script will preserve content between:
```markdown
<!-- MANUAL ADDITIONS START -->
[your custom content]
<!-- MANUAL ADDITIONS END -->
```

## Future Considerations

1. Consider consolidating additional agent files into `AGENTS.md` if they share common guidelines
2. Monitor if any agents require agent-specific instructions that can't be consolidated
3. Evaluate removing legacy `.github/copilot-instructions.md` after a transition period

## Testing

The consolidation has been verified:
- ✅ Script syntax is valid
- ✅ AGENTS.md contains all content from copilot-instructions.md
- ✅ Deprecation notices in place
- ✅ Documentation updated
- ✅ File paths correctly redirected in script
