<template>
    <div class="markdown-body" v-external-links="handleExternalLink" v-html="renderedContent" :id="'markdown-viewer-' + (props.content?.length || 0)"></div>
</template>

<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import { open } from '@tauri-apps/plugin-shell';

const props = defineProps({
    content: {
        type: [String, Array, null],
        required: false,
        default: null
    }
});

// Handle external link clicks
const handleExternalLink = async (href) => {
    try {
        await open(href);
    } catch (error) {
        console.error('Failed to open external link:', error);
    }
};

// Custom directive to handle external links
const vExternalLinks = {
    mounted: (el, binding) => {
        el.addEventListener('click', (event) => {
            const target = event.target.closest('a');
            if (!target) return;

            const href = target.getAttribute('href');
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                event.preventDefault();
                binding.value(href);
            }
        });
    }
};

const md = new MarkdownIt({
    html: true,
    linkify: true,
}).use((md) => {
    const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const href = token.attrGet('href');
        
        // Just add the href attribute, the click handling is done by the directive
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
            token.attrSet('href', href);
        }

        return defaultRender(tokens, idx, options, env, self);
    };
});

// Function to convert Jira wiki markup to markdown
const convertJiraToMarkdown = (text) => {
    if (!text) return '';

    return text
        // Headers
        .replace(/h1\.(.*?)$/gm, '# $1')
        .replace(/h2\.(.*?)$/gm, '## $1')
        .replace(/h3\.(.*?)$/gm, '### $1')
        .replace(/h4\.(.*?)$/gm, '#### $1')
        .replace(/h5\.(.*?)$/gm, '##### $1')
        .replace(/h6\.(.*?)$/gm, '###### $1')
        // Text formatting
        .replace(/\*([^*\n]+)\*/g, '**$1**')  // Bold
        .replace(/_([^_\n]+)_/g, '*$1*')      // Italic
        .replace(/\{\{([^}]+)\}\}/g, '`$1`')  // Monospace
        // Lists
        .replace(/^[-*]\s+/gm, '- ')         // Unordered lists
        .replace(/^#(?!#|\s*[A-Za-z])\s+/gm, '1. ')  // Jira wiki ordered lists only
        // Links - handle both Jira and standard markdown links
        .replace(/\[([^|]+)\|([^\]]+)\]/g, '[$2]($1)')  // Jira links with text
        .replace(/(?<!\[)[^\]]*\]\(([^)]+)\)/g, match => match)  // Preserve standard markdown links
        .replace(/(?<!\[)[^\]](?!\])\[([^\]]+)\](?!\()/g, '<$1>')  // Only convert bare brackets to Jira style
        // Tables
        .replace(/\|\|/g, '|')                // Table cells
        // Code blocks
        .replace(/{code(:([^}]+))?}([\s\S]*?){code}/g, '```$2\n$3\n```')
        // Quotes
        .replace(/^bq\.\s*(.*?)$/gm, '> $1');
};

// Function to format an array into a markdown numbered list
const formatList = (array) => {
    return array
        .map((item, index) => `${index + 1}. ${item}`)
        .join('\n');
};

const renderedContent = computed(() => {
    let contentToRender = props.content;
    
    // Handle null or undefined content
    if (contentToRender === null || contentToRender === undefined) {
        return '';
    }
    
    if (Array.isArray(contentToRender)) {
        contentToRender = formatList(contentToRender);
    }
    // Convert Jira markup to markdown before rendering
    contentToRender = convertJiraToMarkdown(contentToRender);
    return md.render(contentToRender);
});
</script>

<style scoped>
.markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.6;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
}

.markdown-body :deep(p) {
    margin-top: 0;
    margin-bottom: 16px;
}

.markdown-body :deep(code) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(175, 184, 193, 0.2);
    border-radius: 6px;
}

.markdown-body :deep(pre) {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
}

.markdown-body :deep(pre code) {
    padding: 0;
    margin: 0;
    font-size: 100%;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border: 0;
}

.markdown-body :deep(blockquote) {
    padding: 0 1em;
    color: #656d76;
    border-left: 0.25em solid #d0d7de;
    margin: 0 0 16px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    padding-left: 2em;
    margin-bottom: 16px;
}
</style>
