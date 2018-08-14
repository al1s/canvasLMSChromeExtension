var port = chrome.runtime.connect({ name: "dunno" });
console.log({ port });
port.onMessage.addListener(msg => {
  console.log(msg);
  var elmToReplace = document.querySelector("#content");
  // tool to play with JSON - https://jqplay.org/
  fetch("https://canvas.instructure.com/api/v1/courses")
    .then(resp => {
      if (resp.ok) return resp.text();
      else throw new Error();
    })
    .then(data => {
      data = data.slice(9);
      data = JSON.parse(data);
      return data[0].id;
    })
    .then(data => {
      fetch(
        `https://canvas.instructure.com/api/v1/courses/${data}/assignments?bucket=upcoming&per_page=100`
      )
        .then(resp => {
          if (resp.ok) return resp.text();
          else throw new Error();
        })
        .then(data => {
          data = data.slice(9);
          data = JSON.parse(data);
          data.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
          data.forEach(elm => {
            var result = {};
            var options = {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric"
            };

            if (elm.discussion_topic) {
              elm.discussion_topic.user_can_see_posts
                ? (result.to_submit = false)
                : (result.to_submit = true);
            } else result.to_submit = !elm.has_submitted_submissions;
            if (result.to_submit) {
              console.warn(
                new Date(elm.due_at).toLocaleDateString("en-US", options),
                result.to_submit,
                elm.html_url,
                elm.name
              );
              elmToReplace.innerText = elm.html_url;
            } else {
              console.log(
                new Date(elm.due_at).toLocaleDateString("en-US", options),
                result.to_submit,
                elm.html_url,
                elm.name
              );
              elmToReplace.innerText = elm.html_url;
            }
          });
        });
    });
});
