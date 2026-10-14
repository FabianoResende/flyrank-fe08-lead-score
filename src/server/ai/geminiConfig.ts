import { GoogleGenAI } from "@google/genai";

/**
 * Modelo usado pelo chat do FE-06.
 *
 * A configuração fica em um módulo separado para facilitar
 * manutenção e futuras extensões no FE-07.
 */
export const GEMINI_MODEL =
  "gemini-3.5-flash-lite";

/**
 * Prompt de sistema do assistente.
 *
 * Define o comportamento geral sem expor instruções ou
 * configurações no código executado pelo navegador.
 */
export const SYSTEM_PROMPT = `
Você é um assistente de qualificação de leads.

Responda em português do Brasil, com clareza, objetividade
e tom profissional.

Ajude a entender a necessidade apresentada pelo usuário,
faça perguntas úteis quando faltar contexto e evite inventar
informações.

Forneça respostas curtas e adequadas para uma interface
de chat em streaming.
`.trim();

/**
 * Cria o cliente Gemini apenas no servidor.
 *
 * A chave é lida de GEMINI_API_KEY no arquivo .env.local.
 * Este módulo nunca deve ser importado por componentes
 * executados no navegador.
 */
export function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "A variável GEMINI_API_KEY não está configurada."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}