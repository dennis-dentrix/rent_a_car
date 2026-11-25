/** The sections of a console in order, each with its pages. An item with no group is a section of its own. */
export function navGroups(items) {
  const groups = []
  for (const item of items) {
    const name = item.group ?? item.label
    const group = groups.find((entry) => entry.name === name)
    if (group) group.items.push(item)
    else groups.push({ name, items: [item] })
  }
  return groups
}

/** The item for the page in view: its own address, or the longest one it sits under. */
export function activeItem(items, pathname) {
  const matches = items.filter(
    (item) => pathname === item.href || (!item.isExact && pathname.startsWith(`${item.href}/`)),
  )
  return matches.sort((a, b) => b.href.length - a.href.length)[0]
}
