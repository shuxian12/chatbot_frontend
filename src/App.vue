<template>
  <div id="app">
    <img alt="Vue logo" src="https://www.advantech.com/css/css-img/advantech-logo-notagl.svg" width="900" height="auto"/>
    <HelloWorld msg="Welcome to Advantech DeviceOn" />
    <VueBotUI 
      :messages="data" 
      :options="botOptions" 
      :bot-typing="botTyping" 
      :input-disable="inputDisable"
      @msg-send="msgSend" 
      @init="botStart" 
    />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import { VueBotUI } from "vue-bot-ui";
import { messageService } from "./helper/message";
import { prompt_gpt3, prompt_chat_gpt4_ref, prompt_chat_gpt4, prompt_gpt3_ref } from "./helper/prompt";
import axios from "axios";

var prompts = [prompt_gpt3, prompt_gpt3_ref]
prompts.push(prompt_chat_gpt4);
prompts.push(prompt_chat_gpt4_ref);

const request = {
    history: [],
    approach: "",
    overrides: {
      top: 3,
    }
  };

const prompt_chat = prompt_gpt3;
const prompt_chat_new = prompt_gpt3_ref;
request.approach = "rrr";

// if you want to use gpt4, please use the following prompt
// const prompt_chat = prompt_chat_gpt4; //promptService.prompt_chat_gpt4;
// const prompt_chat_new = prompt_chat_gpt4_ref; //promptService.prompt_chat_gpt4_ref;
// request.approach = "gpt4";

// overrides: {
//   semantic_ranker: options.overrides?.semanticRanker,
//   semantic_captions: options.overrides?.semanticCaptions,
//   top: options.overrides?.top,
//   temperature: options.overrides?.temperature,
//   prompt_template: options.overrides?.promptTemplate,
//   prompt_template_prefix: options.overrides?.promptTemplatePrefix,
//   prompt_template_suffix: options.overrides?.promptTemplateSuffix,
//   exclude_category: options.overrides?.excludeCategory,
//   suggest_followup_questions: options.overrides?.suggestFollowupQuestions
// }

var count = 0;
var history = [];

// backend api url
// axios.defaults.baseURL = "https://advantech-intern-chatbot-api.azurewebsites.net";
axios.defaults.baseURL = "http://20.222.54.119:5000";

export default {
  name: "App",
  components: {
    HelloWorld,
    VueBotUI
  },
  data() {
    return {
      data: [],
      botTyping: false,
      inputDisable: true,
      botOptions: {
        botTitle: "Advantech Chatbot",
        inputDisablePlaceholder: "Please wait for the bot to respond...",
        colorScheme: "#f69200",
        bubbleBtnSize: 75, //56,
        msgBubbleBgUser: '#e6a102'
      },
    };
  },
  methods: {
    botStart() {
      // console.log("=== count ===", count);
      if (count === 0) {
        console.log("=== botStart ===");
        this.botTyping = true;
        setTimeout(() => {
          this.botTyping = false;
          this.inputDisable = false;
          this.data.push({
            agent: "bot",
            type: "text",
            text: "Hello"
          });
        }, 2000);
        count++;
      }
    },

    msgSend(value) {
      console.log("=== msgSend ===", value);

      this.data.push({
        agent: "user",
        type: "text",
        text: value["text"]
      });

      // this.getResponse();
      this.chat(value["text"]);  // no ref
      // this.chat_test(value["text"]);  //debug
    },

    chat(query) {
      console.log("=== chat ===");
      this.inputDisable = true;
      this.botTyping = true;

      if (history.length > 8) {
        history = history.slice(-8);
      }
      history.push({
        user: query
      });

      request.history = history;
      request.overrides.prompt_template = prompt_chat;
      axios.post("/chat", request,
        { headers: { "Content-Type": "application/json" } }
      ).then((response) => {
        console.log(">> response: ", response);

        messageService.createMessage(response.data.answer).then((msg) => {
          const replyMessage = {
            agent: "bot",
            ...msg
          };
          this.data.push(replyMessage);
        });
        history[history.length - 1]["bot"] = response.data.answer;


        // finish
        this.botTyping = false;
        this.inputDisable = false;
      });
    },

    chat_test(query) {
      console.log("=== chat test ===");
      this.inputDisable = true;
      this.botTyping = true;

      if (history.length > 8) {
        history = history.slice(-8);
      }
      history.push({
        user: query
      });

      request.history = history;
      request.overrides.prompt_template = prompt_chat_new;
      axios.post("/chat", request,
        { headers: { "Content-Type": "application/json" } }
      ).then((response) => {
        console.log(">> response: ", response);
        let ans = response.data.answer;
        const parser_ans = ans.split(/\[([^\]]+)\]/g);
        const citations = [];

        if (parser_ans.length > 1) {  // has citation
          const fragments = parser_ans.map((part, index) => {
            if (index % 2 === 0) {
              return part;
            } else {
              console.log('part: ', part);
              let citationIndex;
              if (citations.indexOf(part) !== -1) {
                  citationIndex = citations.indexOf(part) + 1;
              } else {
                  citations.push(part);
                  citationIndex = citations.length;
              }
      
              return `[${citationIndex}]` //`<a href="${path}" target="_blank">[${citationIndex}]</a>`;
            }
          });

          ans = fragments.join("");
          
          messageService.createMessage(ans, response.data.data_points, citations).then((msg) => {
            const replyMessage = {
              agent: "bot",
              ...msg
            };
            this.data.push(replyMessage);
          });
        }
        else{
          messageService.createMessage(ans, response.data.data_points).then((msg) => {
            const replyMessage = {
              agent: "bot",
              ...msg
            };
            this.data.push(replyMessage);
          });
        }

        history[history.length - 1]["bot"] = response.data.answer;

        // finish
        this.botTyping = false;
        this.inputDisable = false;
      });
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.qkb-msg-bubble-component__text {
  text-align: left;
  white-space: pre-wrap;
}
</style>
