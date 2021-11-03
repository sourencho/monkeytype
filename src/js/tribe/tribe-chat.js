import * as Notifications from "./notifications";
import * as Tribe from "./tribe";

let lastMessageTimestamp = 0;
let shouldScrollChat = true;

export function reset() {
  $(".pageTribe .lobby .chat .messages").empty();
  $(".pageTest #result .tribeResultChat .chat .messages").empty();
}

function limitChatMessages() {
  let messages1 = $(".pageTribe .lobby .chat .messages .message");
  let messages2 = $(
    ".pageTest #result .tribeResultChat .chat .messages .message"
  );

  let limit = 100;

  //they should be in sync so it doesnt matter if i check one length
  if (messages1 <= limit) return;

  let del = messages1.length - limit;

  for (let i = 0; i < del; i++) {
    $(messages1[i]).remove();
    $(messages2[i]).remove();
  }
}

export function scrollChat() {
  let chatEl = $(".pageTribe .lobby .chat .messages")[0];
  let chatEl2 = $(".pageTest #result .tribeResultChat .chat .messages")[0];

  if (shouldScrollChat) {
    chatEl.scrollTop = chatEl.scrollHeight;
    // chatEl2.scrollTop = chatEl2.scrollHeight;
    shouldScrollChat = true;
  }
}

export function appendMessage(data) {
  let cls = "message";
  let author = "";
  if (data.isSystem) {
    cls = "systemMessage";
  } else {
    let me = "";
    if (data.from.id == Tribe.socket.id) me = " me";
    author = `<div class="author ${me}">${data.from.name}:</div>`;
  }
  // data.message = await insertImageEmoji(data.message);

  let previousAuthor = $(".pageTribe .lobby .chat .messages .message")
    .last()
    .find(".author")
    .text();
  previousAuthor = previousAuthor.substring(0, previousAuthor.length - 1);

  if (previousAuthor == data?.from?.name) {
    // author = author.replace(`class="author`, `class="author invisible`);
  } else {
    cls += " newAuthor";
  }

  $(".pageTribe .lobby .chat .messages").append(`
    <div class="${cls}">${author}<div class="text">${data.message}</div></div>
  `);
  $(".pageTest #result .tribeResultChat .chat .messages").append(`
    <div class="${cls}">${author}<div class="text">${data.message}</div></div>
  `);
  limitChatMessages();
  scrollChat();
}

$(".pageTribe .tribePage.lobby .chat .input input").keyup((e) => {
  if (e.key === "Enter") {
    let msg = $(".pageTribe .lobby .chat .input input").val();
    if (msg === "") return;
    if (msg.length > 512) {
      Notifications.add("Message cannot be longer than 512 characters.", 0);
      return;
    }
    if (performance.now() < lastMessageTimestamp + 500) return;
    lastMessageTimestamp = performance.now();
    //TODO reenable
    // sendIsTypingUpdate(false);
    Tribe.socket.emit("chat_message", {
      message: msg,
    });
    $(".pageTribe .lobby .chat .input input").val("");
  }
});

$(document).keydown((e) => {
  //TODO only enalbe while chat is visible
  if (
    e.key === "/" &&
    !$(".pageTribe .lobby .chat .input input").is(":focus")
  ) {
    $(".pageTribe .lobby .chat .input input").focus();
    e.preventDefault();
  }
});