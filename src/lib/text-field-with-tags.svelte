<svelte:options customElement="text-field-with-tags" />

<script lang="ts">
	let content: string = '';
	let suggestions: string[] = [];
	const allTags: string[] = ['#todo', '#svelte', '#highlight', '#example'];
	const tagRegex = /#[a-z]+/g;

	// Typdefinition für Token, die entweder einfachen Text oder ein Tag repräsentieren
	type Token = { type: 'text'; value: string } | { type: 'tag'; value: string };

	// Zerlegt den Text in Token, um die Syntax-Highlights zu erzeugen
	function parseText(text: string): Token[] {
		const tokens: Token[] = [];
		let lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = tagRegex.exec(text)) !== null) {
			if (match.index > lastIndex) {
				tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
			}
			tokens.push({ type: 'tag', value: match[0] });
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < text.length) {
			tokens.push({ type: 'text', value: text.slice(lastIndex) });
		}
		return tokens;
	}

	// Referenz auf die Textarea, um die Cursorposition auszulesen
	let textareaEl: HTMLTextAreaElement;

	// Ermittelt das Wort an einer gegebenen Position im Text
	function getWordAt(text: string, position: number): { word: string; start: number; end: number } {
		let start = position;
		let end = position;
		while (start > 0 && !/\s/.test(text[start - 1])) {
			start--;
		}
		while (end < text.length && !/\s/.test(text[end])) {
			end++;
		}
		return { word: text.slice(start, end), start, end };
	}

	// Aktualisiert die Vorschläge basierend auf dem Wort unter dem Cursor
	function updateSuggestions(): void {
		const cursorPos = textareaEl ? textareaEl.selectionStart : content.length;
		const { word } = getWordAt(content, cursorPos);
		if (word.startsWith('#')) {
			suggestions = allTags.filter((tag: string) => tag.startsWith(word));
		} else {
			suggestions = [];
		}
	}

	// Wird beim Eintippen in die Textarea aufgerufen
	function handleInput(event: Event): void {
		const target = event.target as HTMLTextAreaElement;
		content = target.value;
		updateSuggestions();
	}

	// Ersetzt das aktuelle Wort (an der Cursorposition) durch den ausgewählten Vorschlag
	function selectSuggestion(suggestion: string): void {
		const cursorPos = textareaEl ? textareaEl.selectionStart : content.length;
		const { start, end } = getWordAt(content, cursorPos);
		content = content.slice(0, start) + suggestion + content.slice(end);
		suggestions = [];
		// Setze den Cursor direkt nach dem eingefügten Vorschlag
		setTimeout(() => {
			if (textareaEl) {
				textareaEl.focus();
				textareaEl.setSelectionRange(start + suggestion.length, start + suggestion.length);
			}
		}, 0);
	}
</script>

<div class="container">
	<!-- Overlay: Hier wird der Inhalt tokenisiert und sicher gerendert -->
	<div class="highlighted-content">
		{#each parseText(content) as token}
			{#if token.type === 'tag'}
				<span class="highlight">{token.value}</span>
			{:else}
				{token.value}
			{/if}
		{/each}
	</div>
	<!-- Textarea: Mit zusätzlichen Event-Handlern, damit bei Klicks und Tastaturaktionen die Vorschläge aktualisiert werden -->
	<textarea
		bind:this={textareaEl}
		bind:value={content}
		on:input={handleInput}
		on:keyup={updateSuggestions}
		on:click={updateSuggestions}
	>
	</textarea>

	{#if suggestions.length > 0}
		<div class="suggestions">
			{#each suggestions as suggestion}
				<button type="button" class="suggestion" on:click={() => selectSuggestion(suggestion)}>
					{suggestion}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.container {
		position: relative;
		font-family: sans-serif;
		font-size: 16px;
		height: 150px;
	}
	/* Gemeinsame Textstile, die für Overlay und Textarea gelten */
	.shared-text {
		font-family: inherit;
		font-size: inherit;
		line-height: 1.5;
		white-space: pre-wrap;
		padding: 5px;
		box-sizing: border-box;
	}
	/* Overlay für Syntax-Highlighting: Basistext unsichtbar, damit nur der Hintergrund sichtbar wird */
	.highlighted-content {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 0;
		color: transparent;
	}
	/* Hervorgehobene Tags: Gelber Hintergrund, aber der Text selbst bleibt transparent */
	.highlight {
		background-color: yellow;
		color: transparent;
	}
	/* Die transparente Textarea, die über dem Overlay liegt */
	textarea {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
		background: transparent;
		color: black;
		border: 1px solid #ccc;
		padding: 5px;
		resize: none;
		overflow: auto;
	}
	/* Gleiche Stile für Overlay und Textarea */
	.highlighted-content,
	textarea {
		font-family: sans-serif;
		font-size: 16px;
		line-height: 1.5;
		white-space: pre-wrap;
		padding: 5px;
		box-sizing: border-box;
	}
	.suggestions {
		position: absolute;
		background: white;
		border: 1px solid #ccc;
		margin-top: 2px;
		z-index: 10;
		max-height: 150px;
		overflow-y: auto;
	}
	.suggestion {
		display: block;
		padding: 2px 5px;
		cursor: pointer;
		background: none;
		border: none;
		text-align: left;
		width: 100%;
	}
	.suggestion:hover,
	.suggestion:focus {
		background: #f0f0f0;
	}
</style>
