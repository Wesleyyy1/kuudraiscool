const currentTitle = {
    title: null,
    subtitle: null,
    time: null
}
let started = null

const _drawTitle = (title, subtitle) => {
    const [ x, y ] = [
        Renderer.screen.getWidth() / 2,
        Renderer.screen.getHeight() / 2
    ]

    Renderer.translate(x, y)
    Renderer.scale(4, 4)
    Renderer.drawStringWithShadow(title, -(Renderer.getStringWidth(title) / 2), -10)

    Renderer.translate(x, y)
    Renderer.scale(2, 2)
    Renderer.drawStringWithShadow(subtitle, -(Renderer.getStringWidth(subtitle) / 2), 5)
}

const showTitle = (title, subtitle, ms) => {
    currentTitle.title = title
    currentTitle.subtitle = subtitle
    currentTitle.time = ms
}

register("renderOverlay", () => {
    if (!currentTitle.time) return
    if (!started) started = Date.now()

    const remainingTime = currentTitle.time - (Date.now() - started)

    if (remainingTime <= 0) {
        currentTitle.title = null
        currentTitle.subtitle = null
        currentTitle.time = null

        started = null

        return
    }

    _drawTitle(currentTitle.title, currentTitle.subtitle)
})

export default showTitle;