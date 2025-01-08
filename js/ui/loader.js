export function createLoader(action) {
    if (action == true) {
        const loaderContainer = document.createElement('div')
        loaderContainer.classList.add('loader-container')

        const loader = document.createElement('div')
        loader.classList.add('loader')
        loaderContainer.appendChild(loader)

        const loaderTop = document.createElement('div')
        loaderTop.classList.add('loader-top')
        loader.appendChild(loaderTop)

        const loaderInnerOval = document.createElement('div')
        loaderInnerOval.classList.add('loader-inner-oval')
        loader.appendChild(loaderInnerOval)

        const loaderCircle1 = document.createElement('div')
        loaderCircle1.classList.add('loader-circle1')
        loaderInnerOval.appendChild(loaderCircle1)

        const loaderCircle2 = document.createElement('div')
        loaderCircle2.classList.add('loader-circle2')
        loaderInnerOval.appendChild(loaderCircle2)

        const loaderCircle3 = document.createElement('div')
        loaderCircle3.classList.add('loader-circle3')
        loaderInnerOval.appendChild(loaderCircle3)

        document.body.appendChild(loaderContainer)
    } else {
        document.querySelector('.loader-container').remove()
    }
}