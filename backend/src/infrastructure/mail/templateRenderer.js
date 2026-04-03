"use strict";

const fs = require("fs");
const path = require("path");
const env = require("../../config/env");
const logger = require("../logger/logger");
const { manifest, APP_NAME, FRONTEND_URL } = require("./templateManifest");

const TEMPLATE_DIRECTORY = path.join(__dirname, "templates");
const BASE_TEMPLATE_FILE = "base.html";
const templateCache = new Map();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const decodeHtmlEntities = (value = "") =>
  String(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const sanitizeHeaderValue = (value = "") =>
  String(value).replace(/[\r\n]+/g, " ").trim();

const resolveValue = (source, keyPath) =>
  keyPath.split(".").reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    return current[key];
  }, source);

const shouldUseCache = () => !env.isDevelopment();

const readTemplateFile = (fileName) => {
  if (shouldUseCache() && templateCache.has(fileName)) {
    return templateCache.get(fileName);
  }

  const filePath = path.join(TEMPLATE_DIRECTORY, fileName);
  const template = fs.readFileSync(filePath, "utf8");

  if (shouldUseCache()) {
    templateCache.set(fileName, template);
  }

  return template;
};

const interpolateHtml = (template, data) => {
  const rawResolved = String(template).replace(
    /{{{\s*([\w.]+)\s*}}}/g,
    (_, keyPath) => {
      const value = resolveValue(data, keyPath);
      return value === undefined || value === null ? "" : String(value);
    },
  );

  return rawResolved.replace(/{{\s*([\w.]+)\s*}}/g, (_, keyPath) => {
    const value = resolveValue(data, keyPath);
    return value === undefined || value === null ? "" : escapeHtml(value);
  });
};

const interpolateText = (template, data) =>
  String(template).replace(/{{\s*([\w.]+)\s*}}/g, (_, keyPath) => {
    const value = resolveValue(data, keyPath);
    return value === undefined || value === null ? "" : String(value);
  });

const htmlToPlainText = (html = "") =>
  decodeHtmlEntities(
    String(html)
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|tr|h1|h2|h3|h4|h5|h6|li|td)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );

const buildBaseContext = (data = {}) => {
  const frontendUrl = data.frontendUrl || FRONTEND_URL;
  const normalizedFrontendUrl = String(frontendUrl).replace(/\/+$/, "");

  return {
    appName: data.appName || APP_NAME,
    frontendUrl: normalizedFrontendUrl,
    privacyUrl: `${normalizedFrontendUrl}/privacy`,
    termsUrl: `${normalizedFrontendUrl}/terms`,
    brandLogoUrl:
      data.brandLogoUrl ||
      "https://raw.githubusercontent.com/sihab-hasan/ticket-bro/main/frontend/src/assets/images/ticket-bro-logo-dark-mode.png",
    currentYear: new Date().getFullYear(),
  };
};

const assertRequiredFields = (templateName, definition, context) => {
  const missing = (definition.required || []).filter((field) => {
    const value = resolveValue(context, field);
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required email template data for "${templateName}": ${missing.join(", ")}`,
    );
  }
};

const buildTemplateContext = (templateName, data = {}) => {
  const definition = manifest[templateName];
  if (!definition) {
    throw new Error(`Unknown email template: ${templateName}`);
  }

  const baseContext = buildBaseContext(data);
  const prepared =
    typeof definition.prepare === "function"
      ? definition.prepare({ ...baseContext, ...data })
      : {};
  const context = {
    ...baseContext,
    ...data,
    ...prepared,
  };

  assertRequiredFields(templateName, definition, context);
  return { definition, context };
};

const renderEmailTemplate = (templateName, data = {}) => {
  const { definition, context } = buildTemplateContext(templateName, data);
  const bodyTemplate = readTemplateFile(definition.fileName);
  const baseTemplate = readTemplateFile(BASE_TEMPLATE_FILE);

  const previewText = sanitizeHeaderValue(
    interpolateText(definition.previewText || "", context),
  );
  const body = interpolateHtml(bodyTemplate, context);
  const html = interpolateHtml(baseTemplate, {
    ...context,
    body,
    previewText,
  });
  const subject = sanitizeHeaderValue(interpolateText(definition.subject, context));
  const text = htmlToPlainText(html);

  return {
    templateName,
    fileName: definition.fileName,
    subject,
    previewText,
    html,
    text,
  };
};

const getAvailableEmailTemplates = () => Object.keys(manifest);

const clearTemplateCache = () => {
  templateCache.clear();
  logger.debug("Email template cache cleared");
};

module.exports = {
  escapeHtml,
  renderEmailTemplate,
  getAvailableEmailTemplates,
  clearTemplateCache,
};
