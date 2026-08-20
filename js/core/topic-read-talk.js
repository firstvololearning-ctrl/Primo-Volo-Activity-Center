(function () {
  "use strict";

  function syncReadTalkResources() {
    const topicSelect =
      document.querySelector("#topicSelect");

    if (!topicSelect) {
      return;
    }

    const topic =
      topicSelect.value || "";

    document
      .querySelectorAll(
        "[data-read-talk-topics]"
      )
      .forEach(resource => {
        const topics =
          (resource.dataset.readTalkTopics || "")
            .split(",")
            .map(value => value.trim())
            .filter(Boolean);

        resource.hidden =
          !topics.includes(topic);
      });
  }

  function init() {
    const topicSelect =
      document.querySelector("#topicSelect");

    if (!topicSelect) {
      return;
    }

    topicSelect.addEventListener(
      "change",
      syncReadTalkResources
    );

    syncReadTalkResources();
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
