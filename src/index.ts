import { ApolloServerPlugin } from '@apollo/server'
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default'
import { parse } from 'node-html-parser'
import type {
  ApolloServerPluginLandingPageCustomizationOptions,
  ApolloServerPluginLandingPageLocalDefaultCustomizableOptions,
  ApolloServerPluginLandingPageProductionDefaultCustomizableOptions,
} from './types'

export function ApolloServerPluginLandingPageLocalDefaultCustomizable(
  options?: ApolloServerPluginLandingPageLocalDefaultCustomizableOptions,
): ApolloServerPlugin {
  const { html, ...rest } = options ?? {}
  return ApolloServerPluginLandingPageDefaultCustomizable(
    ApolloServerPluginLandingPageLocalDefault(rest),
    { html },
  )
}

export function ApolloServerPluginLandingPageProductionDefaultCustomizable(
  options?: ApolloServerPluginLandingPageProductionDefaultCustomizableOptions,
): ApolloServerPlugin {
  const { html, ...rest } = options ?? {}
  return ApolloServerPluginLandingPageDefaultCustomizable(
    ApolloServerPluginLandingPageProductionDefault(rest),
    { html },
  )
}

function ApolloServerPluginLandingPageDefaultCustomizable(
  wrappedPlugin: ApolloServerPlugin,
  customizationOptions: ApolloServerPluginLandingPageCustomizationOptions,
): ApolloServerPlugin {
  const { html: htmlCustomizationOptions } =
    getValidCustomizationOptions(customizationOptions)

  return {
    async serverWillStart(server) {
      if (wrappedPlugin.serverWillStart === undefined) {
        return
      }

      const serverWillStartReturnedObject =
        await wrappedPlugin.serverWillStart(server)

      if (!serverWillStartReturnedObject) {
        return
      }

      // the dereferenced method does not seem to access `this`, but we bind it to be safe (and prevent lint warnings)
      const renderLandingPageHandler =
        serverWillStartReturnedObject.renderLandingPage?.bind(
          serverWillStartReturnedObject,
        )

      if (renderLandingPageHandler === undefined) {
        return
      }

      return {
        async renderLandingPage() {
          const renderLandingPageReturnedObject =
            await renderLandingPageHandler()
          const { html } = renderLandingPageReturnedObject
          const landingPageHtml =
            typeof html === 'function' ? await html() : html

          return {
            html: transformHtml(landingPageHtml, htmlCustomizationOptions),
          }
        },
      }
    },
  }
}

function transformHtml(
  html: string,
  htmlCustomizationOptions: ApolloServerPluginLandingPageCustomizationOptions['html'],
): string {
  const root = parse(html)
  const head = root
    .getElementsByTagName('html')
    .at(0)
    ?.getElementsByTagName('head')
    .at(0)

  if (!head) {
    return html
  }

  if (htmlCustomizationOptions?.title !== undefined) {
    const title = head.getElementsByTagName('title').at(0)
    title?.set_content(htmlCustomizationOptions.title)
  }

  if (htmlCustomizationOptions?.faviconUrl !== undefined) {
    const links = head.getElementsByTagName('link')
    const iconRelLink = links.find(
      (htmlElement) => htmlElement.getAttribute('rel') === 'icon',
    )
    const appleTouchIconRelLink = links.find(
      (htmlElement) => htmlElement.getAttribute('rel') === 'apple-touch-icon',
    )

    if (iconRelLink && appleTouchIconRelLink) {
      iconRelLink.setAttribute('href', htmlCustomizationOptions.faviconUrl)
      appleTouchIconRelLink.setAttribute(
        'href',
        htmlCustomizationOptions.faviconUrl,
      )
    }
  }

  if (htmlCustomizationOptions?.metaDescriptionContent) {
    const descriptionNameMeta = head
      .getElementsByTagName('meta')
      .find((htmlElement) => htmlElement.getAttribute('name') === 'description')
    descriptionNameMeta?.setAttribute(
      'content',
      htmlCustomizationOptions.metaDescriptionContent,
    )
  }

  return root.toString()
}

function getValidCustomizationOptions(
  options: unknown,
): ApolloServerPluginLandingPageCustomizationOptions {
  return {
    ...(isNonNullObject(options) && hasNonNullObjectProp(options, 'html')
      ? {
          html: {
            ...(hasStringProp(options.html, 'title') && {
              title: options.html.title,
            }),
            ...(hasStringProp(options.html, 'faviconUrl') && {
              faviconUrl: options.html.faviconUrl,
            }),
            ...(hasStringProp(options.html, 'metaDescriptionContent') && {
              metaDescriptionContent: options.html.metaDescriptionContent,
            }),
          } satisfies NonNullable<
            ApolloServerPluginLandingPageCustomizationOptions['html']
          >,
        }
      : {}),
  }
}

function isNonNullObject(o: unknown): o is object {
  return !!o && typeof o === 'object'
}

function hasNonNullObjectProp<T extends PropertyKey>(
  o: object,
  key: T,
): o is object & { [k in T]: object } {
  return key in o && isNonNullObject((o as typeof o & Record<T, unknown>)[key])
}

function hasStringProp<T extends PropertyKey>(
  o: object,
  key: T,
): o is object & { [k in T]: string } {
  return (
    key in o && typeof (o as typeof o & Record<T, unknown>)[key] === 'string'
  )
}
