import {customDomainUsed, getDomain, getHost} from "~/lib/utils.js";

/**
 * Added by Caddy when proxying to the app
 * @type {string}
 */
const customDomainHeaderName = 'user-custom-domain'

/**
 * List of routes that can be used with a custom domain
 * @type {string[]}
 */
const customDomainAllowedRoutes = ['forms-slug']

function redirectToMainDomain(reason = 'unknown') {
  console.warn('Redirecting to main domain', { reason })
  return navigateTo(useRuntimeConfig().public.appUrl + '?utm_source=failed_custom_domain_redirect', { redirectCode: 301, external: true })
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (!customDomainUsed()) return

  const config = useRuntimeConfig()

  const customDomainHeaderValue = useRequestHeaders()[customDomainHeaderName]
  if (!customDomainHeaderValue || customDomainHeaderValue !== getDomain(getHost())) {
    // If custom domain header doesn't match, redirect
    console.error('Custom domain header does not match, redirecting',{
      'customDomainHeaderValue': customDomainHeaderValue,
      'host': getDomain(getHost()),
    })
    return redirectToMainDomain('header_mismatch')
  }

  if (!config.public.customDomainsEnabled) {
    // If custom domain not allowed, redirect
    return redirectToMainDomain('custom_domains_disabled')
  }

  if (!customDomainAllowedRoutes.includes(to.name)) {
    // Custom domain only allowed for form url
    return redirectToMainDomain('route_not_allowed')
  }
})

