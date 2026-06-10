import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";
import crypto from "crypto";
let _sharp = null;
async function getSharp() {
    if (_sharp) return _sharp;
    try { _sharp = (await import('sharp')).default; return _sharp; } catch {}
    return null;
}
import { PassThrough, Readable } from "stream";
import fs from "node:fs";

const VERSION = "4.6";

const CACHE_PATH = "./temporary/latex_dimensions.json";
let latexCache = new Map();
try {
  if (fs.existsSync(CACHE_PATH)) {
    latexCache = new Map(JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")));
  }
} catch (e) {}

function saveCache() {
  try {
    fs.writeFileSync(
      CACHE_PATH,
      JSON.stringify([...latexCache.entries()]),
      "utf-8",
    );
  } catch (e) {}
}

function createIE(type, ie) {
  if (type == "hyperlink") {
    return {
      key: ie.key,
      metadata: {
        display_name: ie.text,
        is_trusted: ie.is_trusted ?? true,
        url: ie.url,
        __typename: "GenAIInlineLinkItem",
      },
    };
  }
  if (type == "citation") {
    return {
      key: ie.key,
      metadata: {
        reference_id: ie.reference_id,
        reference_url: ie.url,
        reference_title: ie.url,
        reference_display_name: ie.url,
        sources: [],
        __typename: "GenAISearchCitationItem",
      },
    };
  }
  if (type == "latex") {
    let fh = Number(ie.font_height) || 50;
    const lines = ie.text ? ie.text.split(/\\\\/g) : [""];
    const textLen = Math.max(...lines.map((l) => l.trim().length)) || 1;

    // Dynamically scale down font_height for long equations to prevent cropping on narrow screens (max width ~280)
    const estimatedWidth = textLen * (fh / 1.8);
    if (estimatedWidth > 280) {
      fh = Math.max(10, Math.floor((280 * 1.8) / textLen));
    }

    const meta = {
      latex_expression: ie.text,
      font_height: fh,
      padding: Number(ie.padding) || 8,
      __typename: "GenAILatexItem",
    };

    if (ie.width && ie.height) {
      const w = Number(ie.width) || 100;
      const h = Number(ie.height) || 50;
      meta.latex_image = {
        url: ie.url,
        width: Math.max(10, Math.round((w / h) * fh)),
        height: fh,
      };
    } else {
      meta.latex_image = Toolkit.resolveLatexDimensions(ie.url, fh);
    }

    return {
      key: ie.key,
      metadata: meta,
    };
  }
}

function extractIE(
  text,
  { extract = true, hyperlink = true, citation = true, latex = true } = {},
) {
  if (!extract) {
    return {
      text,
      ie: [],
      inline_entities: [],
    };
  }
  let ie = [],
    inline_entities = [],
    result = "",
    last = 0,
    citation_index = 1,
    hyperlink_index = 0,
    latex_index = 0,
    stack = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] == "[" && text[i - 1] != "\\") {
      stack.push(i);
    } else if (text[i] == "]" && text[i - 1] != "\\") {
      if (text[i + 1] == "(" || text[i + 1] == "<") {
        let start = stack.pop();
        if (start == null) continue;
        let open = text[i + 1],
          close = open == "(" ? ")" : ">",
          type = open == "(" ? "link" : "latex",
          end = i + 2,
          depth = 1;
        while (end < text.length && depth) {
          if (text[end] == open && text[end - 1] != "\\") depth++;
          else if (text[end] == close && text[end - 1] != "\\") depth--;
          end++;
        }
        if (depth) continue;
        let raw = text.slice(start + 1, i).trim(),
          url = text.slice(i + 2, end - 1).trim(),
          key,
          tag,
          data;
        if (type == "latex") {
          if (!latex) continue;
          let txt = raw;
          let width = null,
            height = null,
            font_height = 50,
            padding = 8;

          const match = raw.match(
            /^(.*?)(?:\|(\d+)\|(\d+)(?:\|(\d+)(?:\|(\d+))?)?)?$/,
          );
          if (match && match[2] && match[3]) {
            txt = match[1];
            width = Number(match[2]);
            height = Number(match[3]);
            if (match[4]) font_height = Number(match[4]);
            if (match[5]) padding = Number(match[5]);
          }

          let cleanUrl = url;
          try {
            const hashIdx = url.indexOf("#");
            if (hashIdx !== -1) {
              const params = new URLSearchParams(url.substring(hashIdx + 1));
              if (params.has("width")) width = Number(params.get("width"));
              if (params.has("height")) height = Number(params.get("height"));
              if (params.has("font_height"))
                font_height = Number(params.get("font_height"));
              if (params.has("padding"))
                padding = Number(params.get("padding"));
              cleanUrl = url.substring(0, hashIdx);
            }
          } catch (e) {}

          key = `KARL_LATEX_${latex_index++}`;
          tag = `{{${key}}}${txt || "image"}{{/${key}}}`;
          data = {
            type: "latex",
            ie: {
              key,
              text: txt,
              url: cleanUrl,
              width,
              height,
              font_height,
              padding,
            },
          };
        } else if (raw) {
          if (!hyperlink) continue;
          const trusted = !url.startsWith("!");
          if (!trusted) {
            url = url.slice(1);
          }
          key = `KARL_HYPERLINK_${hyperlink_index++}`;
          tag = `{{${key}}}${raw}{{/${key}}}`;
          data = {
            type: "hyperlink",
            ie: {
              key,
              text: raw,
              url,
              is_trusted: trusted,
            },
          };
        } else {
          if (!citation) continue;
          key = `KARL_CITATION_${citation_index - 1}`;
          tag = `{{${key}}}${url}{{/${key}}}`;
          data = {
            type: "citation",
            ie: {
              reference_id: citation_index++,
              key,
              text: "",
              url,
            },
          };
        }
        result += text.slice(last, start) + tag;
        last = end;
        ie.push(data);

        const entity = createIE(data.type, data.ie);
        if (entity) {
          inline_entities.push(entity);
        }

        i = end - 1;
      } else {
        stack.pop();
      }
    }
  }
  result += text.slice(last);
  return {
    text: result,
    ie,
    inline_entities,
  };
}

async function waitAllPromises(input) {
  const isPromise = (v) => v && typeof v.then === "function";
  const isObject = (v) => v && typeof v === "object";

  const deep = async (v) => {
    if (isPromise(v)) return deep(await v);
    if (Array.isArray(v)) return Promise.all(v.map(deep));
    if (isObject(v)) {
      const entries = await Promise.all(
        Object.entries(v).map(async ([k, val]) => [k, await deep(val)]),
      );
      return Object.fromEntries(entries);
    }
    return v;
  };

  return deep(await input);
}

class Toolkit {
  constructor() {}

  static extractIE(
    text,
    { extract = true, hyperlink = true, citation = true, latex = true } = {},
  ) {
    return extractIE(text, { extract, hyperlink, citation, latex });
  }

  static async resize(buffer, x, y, fit = "cover") {
    const _s = await getSharp();
    if (!_s) return buffer;
    return await _s(buffer)
      .resize(x, y, {
        fit,
        position: "center",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  }

  static async waitAllPromises(input) {
    return await waitAllPromises(input);
  }

  static async fetchBuffer(url, options = {}, config = {}) {
    try {
      let response = await fetch(url, options);
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (config.silent ?? true) return Buffer.alloc(0);
      throw error;
    }
  }

  static async resolveLatexDimensions(url, font_height) {
    const fh = font_height || 45;
    if (latexCache.has(url)) {
      const cached = latexCache.get(url);
      const w = cached.width || 100;
      const h = cached.height || 50;
      return {
        url,
        width: Math.max(10, Math.round((w / h) * fh)),
        height: fh,
      };
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const _s2 = await getSharp();
        if (!_s2) return { url, width: 100, height: fh };
        const metaData = await _s2(buffer).metadata();
        const w = metaData.width || 100;
        const h = metaData.height || 50;

        latexCache.set(url, { width: w, height: h });
        saveCache();

        return {
          url,
          width: Math.max(10, Math.round((w / h) * fh)),
          height: fh,
        };
      }
    } catch (e) {
      console.error(
        "[latex] Fetch dimensions failed, using estimation:",
        e.message,
      );
    }

    let formula = "";
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname === "latex.codecogs.com") {
        const query = parsedUrl.search || "";
        formula = decodeURIComponent(query.replace(/^\?/, ""));
        formula = formula
          .replace(/\\dpi\{\d+\}/g, "")
          .replace(/\\bg\{[a-zA-Z0-9#_]+\}/g, "")
          .replace(/\\color\{[a-zA-Z0-9#_]+\}/g, "")
          .replace(/\\space\s+/g, "")
          .trim();
      }
    } catch (e) {}

    if (!formula) {
      formula = url.split("/").pop() || "";
    }

    const cleanExpr = formula.replace(/\\[a-zA-Z]+/g, " ");
    const charCount = Math.max(5, cleanExpr.length);
    const estWidth = Math.max(30, charCount * 8.5);
    const estHeight =
      formula.includes("\\frac") ||
      formula.includes("\\sum") ||
      formula.includes("\\int")
        ? 32
        : 20;

    return {
      url,
      width: Math.max(10, Math.round((estWidth / estHeight) * fh)),
      height: fh,
    };
  }

  static async toUrl(_client, path, mediaType = "document") {
    if (!path) throw new Error("Url or buffer needed");

    const media = await prepareWAMessageMedia(
      {
        [mediaType]: Buffer.isBuffer(path) ? path : { url: path },
      },
      {
        upload: _client.waUploadToServer,
        jid: "\u0040\u006e\u0065\u0077\u0073\u006c\u0065\u0074\u0074\u0065\u0072",
      },
    );

    return Object.values(media)[0]?.url;
  }

  static async resolveMedia(
    _client,
    media,
    mediaType = "image",
    {
      resolveUrl = false,
      resolveWAUrl = false,
      result = "url",
      resize = false,
      width = 300,
      height = 300,
    } = {},
  ) {
    const isUrl = (str) => /^https?:\/\/.+/i.test(str);
    const isWAUrl = (str) => /^https?:\/\/[^/]*\.whatsapp\.net\//i.test(str);

    if (Array.isArray(media)) {
      return Promise.all(
        media.map((item) =>
          Toolkit.resolveMedia(_client, item, mediaType, {
            resolveUrl,
            resolveWAUrl,
            result,
            resize,
            width,
            height,
          }),
        ),
      );
    }

    const originalIsBuffer = Buffer.isBuffer(media);

    if (typeof media === "string" && isUrl(media)) {
      if (isWAUrl(media)) {
        if (resolveWAUrl) {
          media = await Toolkit.fetchBuffer(media, {}, { silent: true });
        } else if (!resolveUrl) {
          if (result === "url") return media;
          media = await Toolkit.fetchBuffer(media, {}, { silent: true });
        }
      } else {
        if (!resolveUrl) {
          if (result === "url") return media;
          media = await Toolkit.fetchBuffer(media, {}, { silent: true });
        } else {
          media = await Toolkit.fetchBuffer(media, {}, { silent: true });
        }
      }
    }

    if (typeof media === "string" && !isUrl(media)) {
      media = Buffer.from(media, "base64");
    }

    if (!Buffer.isBuffer(media) || !media.length) {
      return;
    }

    if (resize && Buffer.isBuffer(media)) {
      media = await Toolkit.resize(media, width, height);
    }

    if (result === "buffer") {
      return media;
    }

    if (result === "base64") {
      return media.toString("base64");
    }

    return Toolkit.toUrl(_client, media, mediaType);
  }

  static getMp4Duration(buffer, { silent = true } = {}) {
    try {
      if (!Buffer.isBuffer(buffer) || buffer.length < 8) {
        if (silent) return 0;
        throw new Error("Invalid buffer");
      }

      let offset = 0;

      while (offset < buffer.length - 8) {
        const size = buffer.readUInt32BE(offset);

        if (size < 8 || offset + size > buffer.length) {
          if (silent) return 0;
          throw new Error("Invalid atom size");
        }

        const type = buffer.toString("ascii", offset + 4, offset + 8);

        if (type === "moov") {
          let moovOffset = offset + 8;
          const moovEnd = offset + size;

          while (moovOffset < moovEnd - 8) {
            const childSize = buffer.readUInt32BE(moovOffset);

            if (childSize < 8 || moovOffset + childSize > moovEnd) {
              if (silent) return 0;
              throw new Error("Invalid child atom size");
            }

            const childType = buffer.toString(
              "ascii",
              moovOffset + 4,
              moovOffset + 8,
            );

            if (childType === "mvhd") {
              const version = buffer.readUInt8(moovOffset + 8);

              if (version === 0) {
                const timescale = buffer.readUInt32BE(moovOffset + 20);
                const duration = buffer.readUInt32BE(moovOffset + 24);

                if (!timescale) {
                  if (silent) return 0;
                  throw new Error("Invalid timescale");
                }

                return duration / timescale;
              }

              if (version === 1) {
                const timescale = buffer.readUInt32BE(moovOffset + 32);
                const duration = Number(
                  buffer.readBigUInt64BE(moovOffset + 36),
                );

                if (!timescale) {
                  if (silent) return 0;
                  throw new Error("Invalid timescale");
                }

                return duration / timescale;
              }
            }

            moovOffset += childSize;
          }
        }

        offset += size;
      }

      if (silent) return 0;
      throw new Error("No mvhd found!");
    } catch (err) {
      if (silent) return 0;
      throw err;
    }
  }

  static getMp4Preview(
    videoBuffer,
    {
      time,
      result = "buffer",
      resize = true,
      width = 300,
      height = 300,
      silent = true,
    } = {},
  ) {
    return new Promise(async (resolve, reject) => {
      const fail = (err) => {
        if (silent) {
          return resolve(result === "base64" ? "" : Buffer.alloc(0));
        }
        return reject(err);
      };

      try {
        if (!Buffer.isBuffer(videoBuffer) || !videoBuffer.length) {
          return fail(new Error("videoBuffer tidak valid atau kosong"));
        }

        const ffmpeg = await import("fluent-ffmpeg")
          .then((m) => m.default)
          .catch(() => null);
        if (!ffmpeg) {
          return fail(new Error("fluent-ffmpeg is not installed"));
        }

        const inputStream = new Readable({ read() {} });
        inputStream.push(videoBuffer);
        inputStream.push(null);

        const outputStream = new PassThrough();
        const chunks = [];

        outputStream.on("data", (chunk) => chunks.push(chunk));

        outputStream.on("end", async () => {
          try {
            let output = Buffer.concat(chunks);

            if (!output.length) {
              return fail(
                new Error("Output kosong — cek format atau timestamp video"),
              );
            }

            if (resize) {
              output = await Toolkit.resize(output, width, height);
            }

            return resolve(
              result === "base64" ? output.toString("base64") : output,
            );
          } catch (err) {
            return fail(err);
          }
        });

        outputStream.on("error", fail);

        time ??= Math.min(Toolkit.getMp4Duration(videoBuffer) * 0.2, 10);

        ffmpeg(inputStream)
          .outputOptions([
            `-ss ${time}`,
            "-vframes 1",
            "-vcodec png",
            "-f image2pipe",
          ])
          .on("error", (err) => fail(new Error(`ffmpeg error: ${err.message}`)))
          .pipe(outputStream, { end: true });
      } catch (err) {
        return fail(err);
      }
    });
  }
}

class BaseBuilder {
  constructor() {
    this._title = "";
    this._subtitle = "";
    this._body = "";
    this._footer = "";
    this._contextInfo = {};
    this._extraPayload = {};
  }

  setTitle(title) {
    if (typeof title !== "string") {
      throw new TypeError("Title must be a string");
    }
    this._title = title;
    return this;
  }

  setSubtitle(subtitle) {
    if (typeof subtitle !== "string") {
      throw new TypeError("Subtitle must be a string");
    }
    this._subtitle = subtitle;
    return this;
  }

  setBody(body) {
    if (typeof body !== "string") {
      throw new TypeError("Body must be a string");
    }
    this._body = body;
    return this;
  }

  setFooter(footer) {
    if (typeof footer !== "string") {
      throw new TypeError("Footer must be a string");
    }
    this._footer = footer;
    return this;
  }

  setContextInfo(obj) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      throw new TypeError("ContextInfo must be a plain object");
    }

    this._contextInfo = obj;
    return this;
  }

  addPayload(obj) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      throw new TypeError("Payload must be a plain object");
    }

    Object.assign(this._extraPayload, obj);

    return this;
  }

  static async resize(buffer, x, y, fit = "cover") {
    return await Toolkit.resize(buffer, x, y, fit);
  }

  static async fetchBuffer(url, options = {}, config = {}) {
    return await Toolkit.fetchBuffer(url, options, config);
  }
}

class Button extends BaseBuilder {
  #client;

  constructor(client) {
    super();
    if (!client) {
      throw new Error("Socket is required");
    }
    this.#client = client;

    this._buttons = [];
    this._data;
    this._currentSelectionIndex = -1;
    this._currentSectionIndex = -1;
    this._params = {};
  }

  setVideo(path, options = {}) {
    if (!path) throw new Error("Url or buffer needed");
    Buffer.isBuffer(path)
      ? (this._data = { video: path, ...options })
      : (this._data = { video: { url: path }, ...options });
    return this;
  }

  setImage(path, options = {}) {
    if (!path) throw new Error("Url or buffer needed");
    Buffer.isBuffer(path)
      ? (this._data = { image: path, ...options })
      : (this._data = { image: { url: path }, ...options });
    return this;
  }

  setDocument(path, options = {}) {
    if (!path) throw new Error("Url or buffer needed");
    Buffer.isBuffer(path)
      ? (this._data = { document: path, ...options })
      : (this._data = { document: { url: path }, ...options });
    return this;
  }

  setMedia(obj) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      throw new TypeError("Media must be a plain object");
    }

    this._data = obj;
    return this;
  }

  async setLocation(thumbnail, name = "", address = "") {
    let jpegThumbnail = null;
    if (thumbnail) {
      const buf = Buffer.isBuffer(thumbnail)
        ? thumbnail
        : await BaseBuilder.fetchBuffer(thumbnail, {}, { silent: true });
      if (buf.length > 0) {
        jpegThumbnail = await BaseBuilder.resize(buf, 300, 300);
      }
    }
    this._data = {
      headerType: 6,
      locationMessage: {
        degreesLatitude: 0,
        degreesLongitude: 0,
        name,
        address,
        jpegThumbnail,
      },
    };
    return this;
  }

  clearButtons() {
    this._buttons = [];
    return this;
  }

  setParams(obj) {
    this._params = obj;
    return this;
  }

  addButton(name, params) {
    this._buttons.push({
      name,
      buttonParamsJson:
        typeof params === "string" ? params : JSON.stringify(params),
    });

    return this;
  }

  makeRow(header = "", title = "", description = "", id = "") {
    if (
      this._currentSelectionIndex === -1 ||
      this._currentSectionIndex === -1
    ) {
      throw new Error("You need to create a selection and a section first");
    }
    const buttonParams = JSON.parse(
      this._buttons[this._currentSelectionIndex].buttonParamsJson,
    );
    buttonParams.sections[this._currentSectionIndex].rows.push({
      header,
      title,
      description,
      id,
    });
    this._buttons[this._currentSelectionIndex].buttonParamsJson =
      JSON.stringify(buttonParams);
    return this;
  }

  makeSection(title = "", highlight_label = "") {
    if (this._currentSelectionIndex === -1) {
      throw new Error("You need to create a selection first");
    }
    const buttonParams = JSON.parse(
      this._buttons[this._currentSelectionIndex].buttonParamsJson,
    );
    buttonParams.sections.push({ title, highlight_label, rows: [] });
    this._currentSectionIndex = buttonParams.sections.length - 1;
    this._buttons[this._currentSelectionIndex].buttonParamsJson =
      JSON.stringify(buttonParams);
    return this;
  }

  addSelection(title, options = {}) {
    this._buttons.push({
      ...options,
      name: "single_select",
      buttonParamsJson: JSON.stringify({ title, sections: [] }),
    });
    this._currentSelectionIndex = this._buttons.length - 1;
    this._currentSectionIndex = -1;
    return this;
  }

  addReply(display_text = "", id = "", options = {}) {
    this._buttons.push({
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text,
        id,
        ...options,
      }),
    });
    return this;
  }

  addCall(display_text = "", id = "", options = {}) {
    this._buttons.push({
      name: "cta_call",
      buttonParamsJson: JSON.stringify({
        display_text,
        id,
        ...options,
      }),
    });
    return this;
  }

  addReminder(display_text = "", id = "", options = {}) {
    this._buttons.push({
      name: "cta_reminder",
      buttonParamsJson: JSON.stringify({
        display_text,
        id,
        ...options,
      }),
    });
    return this;
  }

  addCancelReminder(display_text = "", id = "", options = {}) {
    this._buttons.push({
      name: "cta_cancel_reminder",
      buttonParamsJson: JSON.stringify({
        display_text,
        id,
        ...options,
      }),
    });
    return this;
  }

  addAddress(display_text = "", id = "", options = {}) {
    this._buttons.push({
      name: "address_message",
      buttonParamsJson: JSON.stringify({
        display_text,
        id,
        ...options,
      }),
    });
    return this;
  }

  addLocation(options = {}) {
    this._buttons.push({
      name: "send_location",
      buttonParamsJson: JSON.stringify(options),
    });
    return this;
  }

  addUrl(
    display_text = "",
    url = "",
    webview_interaction = false,
    options = {},
  ) {
    this._buttons.push({
      ...options,
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text,
        url,
        webview_interaction,
        ...options,
      }),
    });
    return this;
  }

  addCopy(display_text = "", copy_code = "", options = {}) {
    this._buttons.push({
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text,
        copy_code,
        ...options,
      }),
    });
    return this;
  }

  static paramsList = {
    limited_time_offer: {
      text: "string",
      url: "string",
      copy_code: "string",
      expiration_time: "number",
    },
    bottom_sheet: {
      in_thread_buttons_limit: "number",
      divider_indices: ["number"],
      list_title: "string",
      button_title: "string",
    },
    tap_target_configuration: {
      title: "string",
      description: "string",
      canonical_url: "string",
      domain: "string",
      buttonIndex: "number",
    },
  };

  async toCard() {
    return {
      body: {
        text: this._body,
      },
      footer: {
        text: this._footer,
      },
      header: {
        title: this._title,
        subtitle: this._subtitle,
        hasMediaAttachment: !!this._data,
        ...(this._data
          ? await prepareWAMessageMedia(this._data, {
              upload: this.#client.waUploadToServer,
            }).catch((e) => {
              if (String(e).includes("Invalid media type")) return this._data;
              throw e;
            })
          : {}),
      },
      nativeFlowMessage: {
        messageParamsJson: JSON.stringify(this._params),
        buttons: this._buttons,
      },
    };
  }

  async build(jid, { mentions, ...options } = {}) {
    const message = await this.toCard();
    const contextInfo = { ...this._contextInfo };
    if (mentions?.length) contextInfo.mentionedJid = mentions;

    return generateWAMessageFromContent(
      jid,
      {
        ...this._extraPayload,
        interactiveMessage: {
          ...message,
          contextInfo,
        },
      },
      { ...options },
    );
  }

  async send(jid, { ...options } = {}) {
    const msg = await this.build(jid, options);

    await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
      additionalNodes: [
        {
          tag: "biz",
          attrs: {},
          content: [
            {
              tag: "interactive",
              attrs: { type: "native_flow", v: "1" },
              content: [
                { tag: "native_flow", attrs: { v: "9", name: "mixed" } },
              ],
            },
          ],
        },
      ],
      ...options,
    });
    return msg;
  }

  setButton(name, params) {
    return this.addButton(name, params);
  }

  async run(jid, sock, options = {}) {
    return this.send(jid, options);
  }
}

class ButtonV2 extends BaseBuilder {
  #client;

  constructor(client) {
    super();
    if (!client) {
      throw new Error("Socket is required");
    }

    this.#client = client;
    this._image;
    this._data;
    this._buttons = [];
  }

  addButton(displayText = "", buttonId = crypto.randomUUID()) {
    this._buttons.push({
      buttonId,
      buttonText: { displayText },
      type: 1,
    });
    return this;
  }

  addRawButton(obj) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      throw new TypeError("Buttons must be a plain object");
    }

    this._buttons.push(obj);
    return this;
  }

  setThumbnail(path) {
    if (!path) throw new Error("Url or buffer needed");
    this._image = path;
    return this;
  }

  setMedia(obj) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      throw new TypeError("Media must be a plain object");
    }

    this._data = obj;
    return this;
  }

  async setLocation(thumbnail, name = "", address = "") {
    let jpegThumbnail = null;
    if (thumbnail) {
      const buf = Buffer.isBuffer(thumbnail)
        ? thumbnail
        : await BaseBuilder.fetchBuffer(thumbnail, {}, { silent: true });
      if (buf.length > 0) {
        jpegThumbnail = await BaseBuilder.resize(buf, 300, 300);
      }
    }
    this._title = name;
    this._subtitle = address;
    this._image = jpegThumbnail;
    return this;
  }

  async build(jid, { mentions, ...options } = {}) {
    let _thumbnail = this._image
      ? await BaseBuilder.resize(
          Buffer.isBuffer(this._image)
            ? this._image
            : await BaseBuilder.fetchBuffer(this._image, {}, { silent: true }),
          300,
          300,
        )
      : null;
    const contextInfo = { ...this._contextInfo };
    if (mentions?.length) contextInfo.mentionedJid = mentions;

    const msg = generateWAMessageFromContent(
      jid,
      {
        ...this._extraPayload,
        buttonsMessage: {
          contentText: this._body,
          footerText: this._footer,
          ...(this._data
            ? this._data
            : {
                headerType: 6,
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                  name: this._title,
                  address: this._subtitle,
                  jpegThumbnail: _thumbnail,
                },
              }),
          viewOnce: true,
          contextInfo,
          buttons: [...this._buttons],
        },
      },
      { ...options },
    );
    return msg;
  }

  async send(jid, { ...options } = {}) {
    if (this._buttons.length < 1)
      throw new Error("ButtonV2 requires at least one button");
    const msg = await this.build(jid, options);

    await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
      additionalNodes: [
        {
          tag: "biz",
          attrs: {},
          content: [
            {
              tag: "interactive",
              attrs: { type: "native_flow", v: "1" },
              content: [
                { tag: "native_flow", attrs: { v: "9", name: "mixed" } },
              ],
            },
          ],
        },
      ],
      ...options,
    });
    return msg;
  }

  async run(jid, sock, options = {}) {
    return this.send(jid, options);
  }
}

class Carousel extends BaseBuilder {
  #client;

  constructor(client) {
    super();
    if (!client) {
      throw new Error("Socket is required");
    }

    this.#client = client;
    this._cards = [];
  }

  addCard(card) {
    const cards = Array.isArray(card) ? card : [card];
    const baseIndex = this._cards.length;

    for (const [index, c] of cards.entries()) {
      if (!c?.header?.hasMediaAttachment) {
        throw new Error(
          `Card [${baseIndex + index}] must include an image or video in header`,
        );
      }
    }

    this._cards.push(...cards);
    return this;
  }

  build(jid, { ...options } = {}) {
    return generateWAMessageFromContent(
      jid,
      {
        ...this._extraPayload,
        interactiveMessage: {
          header: {
            hasMediaAttachment: false,
          },
          body: { text: this._body },
          footer: { text: this._footer },
          contextInfo: this._contextInfo,
          carouselMessage: {
            cards: this._cards,
          },
        },
      },
      { ...options },
    );
  }

  async send(jid, { ...options } = {}) {
    const msg = this.build(jid, options);

    await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
      additionalNodes: [
        {
          tag: "biz",
          attrs: {},
          content: [
            {
              tag: "interactive",
              attrs: { type: "native_flow", v: "1" },
              content: [
                { tag: "native_flow", attrs: { v: "9", name: "mixed" } },
              ],
            },
          ],
        },
      ],
      ...options,
    });
    return msg;
  }

  async run(jid, sock, options = {}) {
    return this.send(jid, options);
  }
}

class AIRich extends BaseBuilder {
  #client;

  constructor(client) {
    if (!client) {
      throw new Error("Socket is required");
    }

    super();
    this.#client = client;
    this._contextInfo = {};
    this._submessages = [];
    this._sections = [];
    this._richResponseSources = [];
    this._pendingUploads = [];
  }

  static newLayout(name, data, extra = {}) {
    return {
      ...extra,
      view_model: {
        [Array.isArray(data) ? "primitives" : "primitive"]: data,
        __typename: `GenAI${name}LayoutViewModel`,
      },
    };
  }

  addSubmessage(submessage) {
    const items = Array.isArray(submessage) ? submessage : [submessage];

    for (const item of items) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        throw new TypeError(
          "Submessage must be a plain object or array of plain objects",
        );
      }

      this._submessages.push(item);
    }

    return this;
  }

  addSection(section) {
    const items = Array.isArray(section) ? section : [section];

    for (const item of items) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        throw new TypeError(
          "Section must be a plain object or array of plain objects",
        );
      }

      this._sections.push(item);
    }

    return this;
  }

  addText(text, { hyperlink = true, citation = true, latex = true } = {}) {
    if (typeof text != "string") {
      throw new TypeError("Text must be a string");
    }

    const extractedIE = extractIE(text, {
      hyperlink,
      citation,
      latex,
    });

    this._submessages.push({
      messageType: 2,
      messageText: extractedIE.text,
    });

    // Auto-insert spacing if previous section was a non-text layout (code, table, image, video, product, reels, etc.)
    if (this._sections.length > 0) {
      const last = this._sections[this._sections.length - 1];
      const lastType = last?.view_model?.primitive?.__typename;
      const lastText = last?.view_model?.primitive?.text;
      if (
        lastType &&
        lastType !== "GenAIMarkdownTextUXPrimitive" &&
        lastText !== " "
      ) {
        this._sections.push(
          AIRich.newLayout("Single", {
            text: " ",
            __typename: "GenAIMarkdownTextUXPrimitive",
          }),
        );
      }
    }

    this._sections.push(
      AIRich.newLayout("Single", {
        text: extractedIE.text,
        ...(extractedIE.inline_entities.length && {
          inline_entities: extractedIE.inline_entities,
        }),
        __typename: "GenAIMarkdownTextUXPrimitive",
      }),
    );

    return this;
  }

  addCode(language, code) {
    if (typeof language !== "string" || typeof code !== "string") {
      throw new TypeError("Language and code must be a string");
    }

    const cleanCode = code.replace(/^[\r\n]+|[\r\n]+$/g, "");
    const meta = AIRich.tokenizer(cleanCode, language);

    this._submessages.push({
      messageType: 5,
      codeMetadata: {
        codeLanguage: language,
        codeBlocks: meta.codeBlock,
      },
    });

    // No auto-inserted spacing

    this._sections.push(
      AIRich.newLayout("Single", {
        language,
        code_blocks: meta.unified_codeBlock,
        __typename: "GenAICodeUXPrimitive",
      }),
    );

    return this;
  }

  addTable(table, { hyperlink = true, citation = true, latex = true } = {}) {
    if (!Array.isArray(table)) {
      throw new TypeError("Table must be an array");
    }

    const meta = AIRich.toTableMetadata(table, { hyperlink, citation, latex });

    this._submessages.push({
      messageType: 4,
      tableMetadata: {
        title: meta.title,
        rows: meta.rows,
      },
    });

    // No auto-inserted spacing

    this._sections.push(
      AIRich.newLayout("Single", {
        rows: meta.unified_rows,
        __typename: "GenATableUXPrimitive",
      }),
    );

    return this;
  }

  addSource(sources = []) {
    if (
      !(
        Array.isArray(sources) &&
        (sources.every((item) => typeof item === "string") ||
          sources.every(
            (item) =>
              Array.isArray(item) && item.every((v) => typeof v === "string"),
          ))
      )
    ) {
      throw new TypeError(
        "Sources must be a string array or an array of string arrays",
      );
    }

    if (sources.every((item) => typeof item === "string")) {
      sources = [sources];
    }

    const source = sources.map(([icon, url, text]) => ({
      source_type: "THIRD_PARTY",
      source_display_name: text ?? "",
      source_subtitle: "AI",
      source_url: url ?? "",
      favicon: {
        url: Toolkit.resolveMedia(this.#client, icon ?? "", "image"),
        mime_type: "image/jpeg",
        width: 16,
        height: 16,
      },
    }));

    this._sections.push(
      AIRich.newLayout("Single", {
        sources: source,
        __typename: "GenAISearchResultPrimitive",
      }),
    );

    return this;
  }

  addReels(reelsItems = []) {
    if (
      !(
        (reelsItems &&
          typeof reelsItems === "object" &&
          !Array.isArray(reelsItems)) ||
        (Array.isArray(reelsItems) &&
          reelsItems.every(
            (item) => item && typeof item === "object" && !Array.isArray(item),
          ))
      )
    ) {
      throw new TypeError(
        "Reels items must be an object or an array of objects",
      );
    }

    if (!Array.isArray(reelsItems)) {
      reelsItems = [reelsItems];
    }

    const reels = reelsItems.map((item) => ({
      ...item,
      _avatar: Toolkit.resolveMedia(
        this.#client,
        item.profileIconUrl ?? item.profile_url ?? item.profile ?? "",
        "image",
      ),
      _thumbnail: Toolkit.resolveMedia(
        this.#client,
        item.thumbnailUrl ?? item.thumbnail ?? "",
        "image",
      ),
    }));

    this._submessages.push({
      messageType: 9,
      contentItemsMetadata: {
        contentType: 1,
        itemsMetadata: reels.map((item) => ({
          reelItem: {
            title: item.username ?? "",
            profileIconUrl: item._avatar,
            thumbnailUrl: item._thumbnail,
            videoUrl: item.videoUrl ?? item.url ?? "",
          },
        })),
      },
    });

    reels.forEach((item, idx) => {
      this._richResponseSources.push({
        provider: "KARL",
        thumbnailCDNURL: item._thumbnail,
        sourceProviderURL: item.videoUrl ?? item.url ?? "",
        sourceQuery: "",
        faviconCDNURL: item._avatar,
        citationNumber: idx + 1,
        sourceTitle: item.username ?? "",
      });
    });

    this._sections.push(
      AIRich.newLayout(
        "HScroll",
        reels.map((item) => ({
          reels_url: item.videoUrl ?? item.url ?? "",
          thumbnail_url: item._thumbnail,
          creator: item.username ?? item.title ?? "",
          avatar_url: item._avatar,
          reels_title: item.reels_title ?? item.title ?? "",
          likes_count: item.likes_count ?? item.like ?? 0,
          shares_count: item.shares_count ?? item.share ?? 0,
          view_count: item.view_count ?? item.view ?? 0,
          reel_source: item.reel_source ?? item.source ?? "IG",
          is_verified: !!(item.is_verified || item.verified),
          __typename: "GenAIReelPrimitive",
        })),
      ),
    );

    return this;
  }

  addImage(imageUrl, { resolveUrl = false } = {}) {
    if (
      !(
        typeof imageUrl === "string" ||
        Buffer.isBuffer(imageUrl) ||
        (Array.isArray(imageUrl) &&
          imageUrl.every((v) => typeof v === "string" || Buffer.isBuffer(v)))
      )
    ) {
      throw new TypeError(
        "imageUrl must be string | buffer | array of string/buffer",
      );
    }

    // No auto-inserted spacing

    const list = Array.isArray(imageUrl)
      ? imageUrl.map((v) => {
          const url = Toolkit.resolveMedia(this.#client, v, "image", {
            resolveUrl,
          });
          return {
            imagePreviewUrl: url,
            imageHighResUrl: url,
            sourceUrl: url,
          };
        })
      : (() => {
          const url = Toolkit.resolveMedia(this.#client, imageUrl, "image", {
            resolveUrl,
          });
          return [
            {
              imagePreviewUrl: url,
              imageHighResUrl: url,
              sourceUrl: url,
            },
          ];
        })();

    this._submessages.push({
      messageType: 1,
      gridImageMetadata: {
        gridImageUrl: {
          imagePreviewUrl: list[0]?.imagePreviewUrl,
        },
        imageUrls: list,
      },
    });

    list.forEach(({ imagePreviewUrl }) => {
      this._sections.push(
        AIRich.newLayout("Single", {
          media: {
            url: imagePreviewUrl,
            mime_type: "image/png",
          },
          imagine_type: "IMAGE",
          status: { status: "READY" },
          __typename: "GenAIImaginePrimitive",
        }),
      );
    });

    return this;
  }

  addVideo(videoUrl, { autoFill = true } = {}) {
    const isObjectVideo = (v) => v && typeof v === "object" && v.url;

    const isValidPrimitive =
      typeof videoUrl === "string" ||
      Buffer.isBuffer(videoUrl) ||
      isObjectVideo(videoUrl) ||
      (Array.isArray(videoUrl) &&
        videoUrl.every(
          (v) =>
            typeof v === "string" || Buffer.isBuffer(v) || isObjectVideo(v),
        ));

    if (!isValidPrimitive) {
      throw new TypeError("videoUrl must be string | buffer | object | array");
    }

    // No auto-inserted spacing

    const items = Array.isArray(videoUrl) ? videoUrl : [videoUrl];

    this._submessages.push({
      messageType: 2,
      messageText: "[ CANNOT_LOAD_VIDEO ]",
    });

    items.forEach((item) => {
      const isObject = isObjectVideo(item);

      const url = isObject
        ? Toolkit.resolveMedia(this.#client, item.url ?? "", "video")
        : Toolkit.resolveMedia(this.#client, item, "video");

      const bufferPromise = autoFill
        ? Promise.resolve(url).then((u) => Toolkit.fetchBuffer(u))
        : null;

      const file_length =
        isObject && item.file_length != null
          ? item.file_length
          : autoFill
            ? bufferPromise.then((b) => b?.length ?? 0)
            : 0;

      const duration =
        isObject && item.duration != null
          ? item.duration
          : autoFill
            ? bufferPromise.then((b) =>
                Toolkit.getMp4Duration(b, {
                  silent: true,
                }),
              )
            : 0;

      const thumbnail =
        isObject && item.thumbnail
          ? Toolkit.resolveMedia(this.#client, item.thumbnail, "image", {
              result: "base64",
              resize: true,
              width: 300,
              height: 300,
            })
          : autoFill
            ? bufferPromise
              ? bufferPromise.then((b) =>
                  Toolkit.getMp4Preview(b, {
                    time: 0,
                    result: "base64",
                  }),
                )
              : null
            : null;

      this._sections.push(
        AIRich.newLayout("Single", {
          media: {
            url,
            mime_type: isObject ? (item.mime_type ?? "video/mp4") : "video/mp4",
            file_length,
            duration,
          },
          imagine_type: "ANIMATE",
          status: { status: "READY" },
          thumbnail: {
            raw_media: thumbnail,
          },
          __typename: "GenAIImaginePrimitive",
        }),
      );
    });

    return this;
  }

  addProduct(data = {}) {
    if (
      !(
        (data && typeof data === "object" && !Array.isArray(data)) ||
        (Array.isArray(data) &&
          data.every(
            (item) => item && typeof item === "object" && !Array.isArray(item),
          ))
      )
    ) {
      throw new TypeError(
        "Product items must be an object or an array of objects",
      );
    }

    this._submessages.push({
      messageType: 2,
      messageText: "[ CANNOT_LOAD_PRODUCT ]",
    });

    const items = Array.isArray(data) ? data : [data];

    const product = items.map((item) => ({
      title: item.title,
      brand: item.brand,
      price: item.price,
      sale_price: item.sale_price,
      product_url: item.product_url ?? item.url,
      image: {
        url: Toolkit.resolveMedia(
          this.#client,
          item.image_url ?? item.image,
          "image",
        ),
      },
      additional_images: [
        {
          url: Toolkit.resolveMedia(
            this.#client,
            item.icon_url ?? item.icon,
            "image",
          ),
        },
      ],
      __typename: "GenAIProductItemCardPrimitive",
    }));

    // Add spacing before product if there is a previous section
    if (this._sections.length > 0) {
      this._sections.push(
        AIRich.newLayout("Single", {
          text: " ",
          __typename: "GenAIMarkdownTextUXPrimitive",
        }),
      );
    }

    this._sections.push(
      AIRich.newLayout(
        Array.isArray(data) ? "HScroll" : "Single",
        Array.isArray(data) ? product : product[0],
      ),
    );

    return this;
  }

  addPost(data = {}) {
    if (
      !(
        (data && typeof data === "object" && !Array.isArray(data)) ||
        (Array.isArray(data) &&
          data.every(
            (item) => item && typeof item === "object" && !Array.isArray(item),
          ))
      )
    ) {
      throw new TypeError(
        "Post items must be an object or an array of objects",
      );
    }

    const posts = Array.isArray(data) ? data : [data];

    this._submessages.push({
      messageType: 2,
      messageText: "[ CANNOT_LOAD_POST ]",
    });

    const primitives = posts.map((p) => ({
      title: p.title ?? "",
      subtitle: p.subtitle ?? "",
      username: p.username ?? "",
      profile_picture_url: Toolkit.resolveMedia(
        this.#client,
        p.profile_picture_url ?? p.profile_url ?? p.profile ?? "",
        "image",
      ),
      is_verified: !!(p.is_verified || p.verified),
      thumbnail_url: Toolkit.resolveMedia(
        this.#client,
        p.thumbnail_url ?? p.thumbnail ?? "",
        "image",
      ),
      post_caption: p.post_caption ?? p.caption ?? "",
      likes_count: p.likes_count ?? p.like ?? 0,
      comments_count: p.comments_count ?? p.comment ?? 0,
      shares_count: p.shares_count ?? p.share ?? 0,
      post_url: p.post_url ?? p.url ?? "",
      post_deeplink: p.post_deeplink ?? p.deeplink ?? "",
      source_app: p.source_app || p.source || "INSTAGRAM",
      footer_label: p.footer_label ?? p.footer ?? "",
      footer_icon: Toolkit.resolveMedia(
        this.#client,
        p.footer_icon ?? p.icon ?? "",
        "image",
      ),
      is_carousel: posts.length > 1,
      orientation: p.orientation ?? "LANDSCAPE",
      post_type: p.post_type ?? "VIDEO",
      __typename: "GenAIPostPrimitive",
    }));

    this._sections.push(AIRich.newLayout("HScroll", primitives));

    return this;
  }

  addTip(text) {
    this._submessages.push({
      messageType: 2,
      messageText: text,
    });

    this._sections.push(
      AIRich.newLayout("Single", {
        text,
        __typename: "GenAIMetadataTextPrimitive",
      }),
    );

    return this;
  }

  addSuggest(suggestion, { scroll = true, layout } = {}) {
    if (
      !(
        typeof suggestion === "string" ||
        (Array.isArray(suggestion) &&
          suggestion.every((v) => typeof v === "string"))
      )
    ) {
      throw new TypeError("Suggestion must be a string or array of strings");
    }

    const suggest = Array.isArray(suggestion)
      ? suggestion.map((text) => ({
          prompt_text: text,
          prompt_type: "SUGGESTED_PROMPT",
          __typename: "GenAIFollowUpSuggestionPillPrimitive",
        }))
      : [
          {
            prompt_text: suggestion,
            prompt_type: "SUGGESTED_PROMPT",
            __typename: "GenAIFollowUpSuggestionPillPrimitive",
          },
        ];

    const type =
      layout ??
      (suggest.length === 1 ? "Single" : scroll ? "HScroll" : "ActionRow");

    this._sections.push(
      AIRich.newLayout(type, type === "Single" ? suggest[0] : suggest, {
        __typename: "GenAIUnifiedResponseSection",
      }),
    );

    return this;
  }

  async build({
    forwarded = true,
    notification = false,
    includesUnifiedResponse = true,
    includesSubmessages = true,
    quoted,
    quotedParticipant,
    ...options
  } = {}) {
    const forward = forwarded
      ? {
          forwardingScore: 1,
          isForwarded: true,
          forwardedAiBotMessageInfo: { botJid: "0@bot" },
          forwardOrigin: 4,
        }
      : {};

    const notif = notification
      ? {
          sessionTransparencyMetadata: {
            disclaimerText: "~ Ahmad tumbuh kembang",
            hcaId: `hca_${Date.now()}`,
            sessionTransparencyType: 1,
          },
        }
      : {};

    const qObj = quoted
      ? {
          stanzaId: quoted?.key?.id || quoted?.id,
          participant:
            quotedParticipant ||
            quoted?.key?.participant ||
            quoted?.key?.remoteJid,
          quotedType: 0,
          quotedMessage:
            typeof quoted === "object" && quoted !== null
              ? (quoted.message ?? quoted)
              : undefined,
        }
      : {};

    const sections = this._footer
      ? [
          ...(await waitAllPromises(this._sections)),
          AIRich.newLayout("Single", {
            text: this._footer,
            __typename: "GenAIMetadataTextPrimitive",
          }),
        ]
      : [...(await waitAllPromises(this._sections))];

    const richResponseSources = await waitAllPromises(
      this._richResponseSources,
    );

    return {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: this._title,
          richResponseSourcesMetadata: {
            sources: richResponseSources,
          },
          ...notif,
        },
      },
      ...this._extraPayload,
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: includesSubmessages
              ? await waitAllPromises(this._submessages)
              : [],
            unifiedResponse: {
              data: includesUnifiedResponse
                ? Buffer.from(
                    JSON.stringify({
                      response_id: crypto.randomUUID(),
                      sections,
                    }),
                  ).toString("base64")
                : "",
            },
            contextInfo: {
              ...forward,
              ...qObj,
              ...this._contextInfo,
            },
          },
        },
      },
    };
  }

  async send(
    jid,
    {
      forwarded,
      notification,
      includesUnifiedResponse,
      includesSubmessages,
      ...options
    } = {},
  ) {
    const msg = await this.build({
      forwarded,
      notification,
      includesUnifiedResponse,
      includesSubmessages,
      ...options,
    });

    return await this.#client.relayMessage(jid, msg, { ...options });
  }

  async run(jid, sock, options = {}) {
    return this.send(jid, options);
  }

  static tokenizer(code, lang = "javascript") {
    const keywordsMap = {
      javascript: new Set([
        "break",
        "case",
        "catch",
        "continue",
        "debugger",
        "delete",
        "do",
        "else",
        "finally",
        "for",
        "function",
        "if",
        "in",
        "instanceof",
        "new",
        "return",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "true",
        "false",
        "null",
        "undefined",
        "class",
        "const",
        "let",
        "super",
        "extends",
        "export",
        "import",
        "yield",
        "static",
        "constructor",
        "async",
        "await",
        "get",
        "set",
      ]),

      typescript: new Set([
        "abstract",
        "any",
        "as",
        "asserts",
        "bigint",
        "boolean",
        "declare",
        "enum",
        "implements",
        "infer",
        "interface",
        "is",
        "keyof",
        "module",
        "namespace",
        "never",
        "readonly",
        "require",
        "number",
        "object",
        "override",
        "private",
        "protected",
        "public",
        "satisfies",
        "string",
        "symbol",
        "type",
        "unknown",
        "using",
        "from",
        "break",
        "case",
        "catch",
        "continue",
        "do",
        "else",
        "finally",
        "for",
        "function",
        "if",
        "new",
        "return",
        "switch",
        "this",
        "throw",
        "try",
        "var",
        "void",
        "while",
        "class",
        "const",
        "let",
        "extends",
        "import",
        "export",
        "async",
        "await",
      ]),

      python: new Set([
        "False",
        "None",
        "True",
        "and",
        "as",
        "assert",
        "async",
        "await",
        "break",
        "class",
        "continue",
        "def",
        "del",
        "elif",
        "else",
        "except",
        "finally",
        "for",
        "from",
        "global",
        "if",
        "import",
        "in",
        "is",
        "lambda",
        "nonlocal",
        "not",
        "or",
        "pass",
        "raise",
        "return",
        "try",
        "while",
        "with",
        "yield",
      ]),

      java: new Set([
        "abstract",
        "assert",
        "boolean",
        "break",
        "byte",
        "case",
        "catch",
        "char",
        "class",
        "const",
        "continue",
        "default",
        "do",
        "double",
        "else",
        "enum",
        "extends",
        "final",
        "finally",
        "float",
        "for",
        "goto",
        "if",
        "implements",
        "import",
        "instanceof",
        "int",
        "interface",
        "long",
        "native",
        "new",
        "package",
        "private",
        "protected",
        "public",
        "return",
        "short",
        "static",
        "strictfp",
        "super",
        "switch",
        "synchronized",
        "this",
        "throw",
        "throws",
        "transient",
        "try",
        "void",
        "volatile",
        "while",
      ]),

      golang: new Set([
        "break",
        "case",
        "chan",
        "const",
        "continue",
        "default",
        "defer",
        "else",
        "fallthrough",
        "for",
        "func",
        "go",
        "goto",
        "if",
        "import",
        "interface",
        "map",
        "package",
        "range",
        "return",
        "select",
        "struct",
        "switch",
        "type",
        "var",
      ]),

      c: new Set([
        "auto",
        "break",
        "case",
        "char",
        "const",
        "continue",
        "default",
        "do",
        "double",
        "else",
        "enum",
        "extern",
        "float",
        "for",
        "goto",
        "if",
        "int",
        "long",
        "register",
        "return",
        "short",
        "signed",
        "sizeof",
        "static",
        "struct",
        "switch",
        "typedef",
        "union",
        "unsigned",
        "void",
        "volatile",
        "while",
      ]),

      cpp: new Set([
        "alignas",
        "alignof",
        "and",
        "auto",
        "bool",
        "break",
        "case",
        "catch",
        "class",
        "const",
        "constexpr",
        "continue",
        "delete",
        "do",
        "double",
        "else",
        "enum",
        "explicit",
        "export",
        "extern",
        "false",
        "float",
        "for",
        "friend",
        "if",
        "inline",
        "int",
        "long",
        "mutable",
        "namespace",
        "new",
        "noexcept",
        "nullptr",
        "operator",
        "private",
        "protected",
        "public",
        "return",
        "short",
        "signed",
        "sizeof",
        "static",
        "struct",
        "switch",
        "template",
        "this",
        "throw",
        "true",
        "try",
        "typedef",
        "typename",
        "union",
        "unsigned",
        "using",
        "virtual",
        "void",
        "while",
      ]),

      php: new Set([
        "abstract",
        "and",
        "array",
        "as",
        "break",
        "callable",
        "case",
        "catch",
        "class",
        "clone",
        "const",
        "continue",
        "declare",
        "default",
        "do",
        "echo",
        "else",
        "elseif",
        "empty",
        "enddeclare",
        "endfor",
        "endforeach",
        "endif",
        "endswitch",
        "endwhile",
        "extends",
        "final",
        "finally",
        "fn",
        "for",
        "foreach",
        "function",
        "global",
        "goto",
        "if",
        "implements",
        "include",
        "include_once",
        "instanceof",
        "interface",
        "match",
        "namespace",
        "new",
        "null",
        "or",
        "private",
        "protected",
        "public",
        "require",
        "require_once",
        "return",
        "static",
        "switch",
        "throw",
        "trait",
        "try",
        "use",
        "var",
        "while",
        "yield",
      ]),

      rust: new Set([
        "as",
        "break",
        "const",
        "continue",
        "crate",
        "else",
        "enum",
        "extern",
        "false",
        "fn",
        "for",
        "if",
        "impl",
        "in",
        "let",
        "loop",
        "match",
        "mod",
        "move",
        "mut",
        "pub",
        "ref",
        "return",
        "self",
        "Self",
        "static",
        "struct",
        "super",
        "trait",
        "true",
        "type",
        "unsafe",
        "use",
        "where",
        "while",
      ]),

      html: new Set([
        "html",
        "head",
        "body",
        "div",
        "span",
        "p",
        "a",
        "img",
        "video",
        "audio",
        "script",
        "style",
        "link",
        "meta",
        "form",
        "input",
        "button",
        "table",
        "tr",
        "td",
        "th",
        "ul",
        "ol",
        "li",
        "section",
        "article",
        "header",
        "footer",
        "nav",
        "main",
      ]),

      bash: new Set([
        "if",
        "then",
        "else",
        "elif",
        "fi",
        "for",
        "while",
        "do",
        "done",
        "case",
        "esac",
        "function",
        "in",
        "select",
        "until",
        "break",
        "continue",
        "return",
        "export",
        "readonly",
        "local",
        "declare",
      ]),

      markdown: new Set(["#", "##", "###", "####", "#####", "######"]),
    };

    if (!lang || lang === "txt" || lang === "text" || lang === "plaintext") {
      return {
        codeBlock: [
          {
            codeContent: code,
            highlightType: 0,
          },
        ],
        unified_codeBlock: [
          {
            content: code,
            type: "DEFAULT",
          },
        ],
      };
    }

    const TYPE_MAP = {
      0: "DEFAULT",
      1: "KEYWORD",
      2: "METHOD",
      3: "STR",
      4: "NUMBER",
      5: "COMMENT",
    };

    const keywords = keywordsMap[lang.toLowerCase()] || new Set();
    const tokens = [];

    let i = 0;

    const push = (content, type) => {
      if (!content) return;
      const last = tokens[tokens.length - 1];
      if (last && last.highlightType === type) {
        last.codeContent += content;
      } else {
        tokens.push({
          codeContent: content,
          highlightType: type,
        });
      }
    };

    const isIdentifier = (char) => {
      switch (lang.toLowerCase()) {
        case "css":
          return /[a-zA-Z0-9_$-]/.test(char);
        case "html":
          return /[a-zA-Z0-9_$:-]/.test(char);
        default:
          return /[a-zA-Z0-9_$]/.test(char);
      }
    };

    while (i < code.length) {
      const c = code[i];

      if (/\s/.test(c)) {
        let s = i;
        while (i < code.length && /\s/.test(code[i])) {
          i++;
        }
        push(code.slice(s, i), 0);
        continue;
      }

      if (
        (c === "/" && code[i + 1] === "/") ||
        (c === "#" && ["python", "bash"].includes(lang))
      ) {
        let s = i;
        while (i < code.length && code[i] !== "\n") {
          i++;
        }
        push(code.slice(s, i), 5);
        continue;
      }

      if (c === '"' || c === "'" || c === "`") {
        let s = i;
        const q = c;
        i++;
        while (i < code.length) {
          if (code[i] === "\\" && i + 1 < code.length) {
            i += 2;
          } else if (code[i] === q) {
            i++;
            break;
          } else {
            i++;
          }
        }
        push(code.slice(s, i), 3);
        continue;
      }

      if (/[0-9]/.test(c)) {
        let s = i;
        while (i < code.length && /[0-9._]/.test(code[i])) {
          i++;
        }
        push(code.slice(s, i), 4);
        continue;
      }

      if (/[a-zA-Z_$]/.test(c)) {
        let s = i;
        while (i < code.length && isIdentifier(code[i])) {
          i++;
        }
        const word = code.slice(s, i);

        let type = 0;
        if (keywords.has(word)) {
          type = 1;
        } else if (lang === "css") {
          let j = i;
          while (j < code.length && /\s/.test(code[j])) {
            j++;
          }
          if (code[j] === ":") {
            type = 1;
          }
        } else if (lang === "html") {
          let p = s - 1;
          while (p >= 0 && /\s/.test(code[p])) {
            p--;
          }
          if (code[p] === "<" || (code[p] === "/" && code[p - 1] === "<")) {
            type = 1;
          }
        }

        if (type === 0) {
          let j = i;
          while (j < code.length && /\s/.test(code[j])) {
            j++;
          }
          if (code[j] === "(") {
            type = 2;
          }
        }

        push(word, type);
        continue;
      }

      push(c, 0);
      i++;
    }

    return {
      codeBlock: tokens,
      unified_codeBlock: tokens.map((t) => ({
        content: t.codeContent,
        type: TYPE_MAP[t.highlightType],
      })),
    };
  }

  static toTableMetadata(
    arr,
    { hyperlink = true, citation = true, latex = true } = {},
  ) {
    if (
      !Array.isArray(arr) ||
      !arr.every(
        (row) =>
          Array.isArray(row) && row.every((cell) => typeof cell === "string"),
      )
    ) {
      throw new TypeError("Table must be a nested array of strings");
    }

    const [header, ...rows] = arr;

    const maxLen = Math.max(header.length, ...rows.map((r) => r.length));

    const normalize = (r) => [...r, ...Array(maxLen - r.length).fill("")];

    const unified_rows = [
      {
        is_header: true,
        cells: normalize(header),
      },
      ...rows.map((r) => ({
        is_header: false,
        cells: normalize(r),
      })),
    ].map((row) => {
      const markdown_cells = row.cells.map((cell) => {
        const extracted = extractIE(cell, { hyperlink, citation, latex });

        return {
          text: extracted.text,
          ...(extracted.inline_entities.length
            ? { inline_entities: extracted.inline_entities }
            : {}),
        };
      });

      return {
        ...row,
        ...(markdown_cells.some((c) => c.inline_entities?.length)
          ? { markdown_cells }
          : {}),
      };
    });

    const rowsMeta = unified_rows.map((r) => ({
      items: r.cells,
      ...(r.is_header ? { isHeading: true } : {}),
    }));

    return {
      title: "",
      rows: rowsMeta,
      unified_rows,
    };
  }
}

export { VERSION, Button, ButtonV2, Carousel, AIRich, Toolkit };
