<script>
  import Sidebar from "../components/Sidebar"
  import Paint from "../components/Paint"

  import { Painting } from "../classes/Painting"
  import { brushes } from "../constants/brushes"
  import { sidebarButtons as buttons } from "../constants/sidebar"
  import { currentBrush$ } from "../stores/currentBrush"
  import { setContext } from "svelte"

  // the contexts are then updated by the CanvasStack component
  const painting = new Painting(currentBrush$, brushes)

  const title = "Visual studio paint"
  const description = "Paint clone made in 1 week."
  const defaultUrl = "https://visual-studio-paint.herokuapp.com"
  const url = process.browser ? window.location.href : defaultUrl
  const logo = "favicon.png"

  // current way of doing things
  setContext("painting", painting)
</script>

<style>
  :global(a) {
    user-select: none;
    -webkit-user-drag: none;
  }
</style>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons"
    rel="stylesheet" />

  <meta name="Description" content={description} />

  <meta property="og:title" content={title} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={`${defaultUrl}/${logo}`} />

  <title>Visual studio paint</title>
</svelte:head>

<Sidebar {buttons}>
  <div class="full" slot="content">
    <Paint height={1000} width={1000} />
  </div>
  <div slot="panel">
    <slot />
  </div>
</Sidebar>
