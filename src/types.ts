import {
  ApolloServerPluginLandingPageLocalDefaultOptions,
  ApolloServerPluginLandingPageProductionDefaultOptions,
} from '@apollo/server/plugin/landingPage/default'

export type ApolloServerPluginLandingPageCustomizationOptions = {
  html?: {
    title?: string
    faviconUrl?: string
    metaDescriptionContent?: string
  }
}

export type ApolloServerPluginLandingPageLocalDefaultCustomizableOptions =
  ApolloServerPluginLandingPageLocalDefaultOptions &
    ApolloServerPluginLandingPageCustomizationOptions
export type ApolloServerPluginLandingPageProductionDefaultCustomizableOptions =
  ApolloServerPluginLandingPageProductionDefaultOptions &
    ApolloServerPluginLandingPageCustomizationOptions
