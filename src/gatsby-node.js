const crumbLabelUpdates = new Map() // mapping pathname without trailing slash to crumbLabel

exports.onCreatePage = ({ page, pathPrefix, actions }, pluginOptions) => {
  if (pluginOptions.useAutoGen) {
    const { createPage, deletePage } = actions

    const defaultOptions = {
      trailingSlashes: false,
      exclude: [],
    }

    const optionsActual = { ...defaultOptions, ...pluginOptions }
    const {
      crumbLabelUpdates: configCrumbLabelUpdates,
      trailingSlashes,
    } = optionsActual

    // import the crumbLabelUpdates from the config on the first execution
    if (crumbLabelUpdates.size === 0) {
      configCrumbLabelUpdates.forEach(({ pathname, crumbLabel }) => {
        // regex removes any trailing slashes from any pathname besides /
        crumbLabelUpdates.set(pathname.replace(/\/$/, ''), crumbLabel)
      })
    }

    // for pages not excludecd, create crumbs out of each section of the page path
    if (!optionsActual.exclude.includes(page.path)) {
      // if crumbLabel is in the page context, add it to crumbLabelUpdates
      const { context: oldPageContext } = page
      if (typeof oldPageContext.crumbLabel !== 'undefined') {
        const pathname = page.path.replace(/\/$/, '') // see above
        if (!crumbLabelUpdates.has(pathname)) {
          crumbLabelUpdates.set(pathname, oldPageContext.crumbLabel)
        }
      }

      let acc = ''
      let crumbs = []
      let pathname = ''

      const splitUrl = pathPrefix
        ? page.path.replace(new RegExp(`^${pathPrefix}`), '').split('/')
        : page.path.split('/')
      splitUrl.forEach((split, index) => {
        if (index === 0 && split === '') {
          // root or 'home' section of path
          crumbs = [
            ...crumbs,
            {
              pathname: '/',
              crumbLabel: optionsActual.autoGenHomeLabel || 'Home',
            },
          ]
        } else if (index !== 0 && split !== '') {
          // remaining sections of path
          acc += `/${split}`

          // update crumbLabel for any crumbLabelUpdates otherwise use path
          let crumbLabel = split
          if (crumbLabelUpdates.has(acc)) {
            crumbLabel = crumbLabelUpdates.get(acc)
          }

          // if trailingSlashes add a trailing slash to the end of
          // each crumb. Excluding root (/) and crumbs including a "." (ex: 404.html)
          if (trailingSlashes && index !== 0 && acc.indexOf('.') === -1) {
            pathname = `${acc}/`
          } else {
            pathname = acc
          }

          crumbs = [
            ...crumbs,
            {
              pathname,
              crumbLabel,
            },
          ]
        } else {
          // catch empty path sections
          crumbs = [...crumbs]
        }
      })

      const breadcrumb = {
        location: page.path,
        crumbs,
      }

      // inject breadcrumbs into page context
      deletePage(page)
      createPage({
        ...page,
        context: {
          ...oldPageContext,
          breadcrumb,
        },
      })
    }
  }
}
