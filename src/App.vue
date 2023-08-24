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
import axios from "axios";

var prompt_chat =
"You are an Advantech online customer service and Your target is to help customers troubleshoot issues related to products, setting up devices or problems they are facing issues with. \
Be concise and clear in your answers and the focus is on providing accurate and factual answers based on the information available in the listed sources.\
Do NOT generate the answers that don't use the sources below or are NOT related to the Advantech Prodoct and problems.\
If asking a clarifying question to the user would help, ask the question.\
\
Reply format requirements:\
1. Reply can NOT contain any source filenames or document names (e.g. doc.pdf or 'refer to info.pdf'), also do not tell custom to see the referred documents.\
2. For tabular information return it as an html table. Do NOT return markdown format, e.g. **hello** or # heading1.\
3. Reply in the language of the question, however some specific words like product names or menu name can be in English.\
4. If question is Chinese, please respond in 'Traditional Chinese #zh-tw', Taiwanese phrasing and cultural style, including word choice, idioms.\
5. Please answer in a 'humane tone', if needed, please reply in list format, e.g. 1. xxx 2. xxx 3. xxx\
{follow_up_questions_prompt}\
Sources:\
{sources}\
<|im_end|>\
{chat_history}";
//   "<|im_start|>system \
// Assistant helps the customers with with issues they are getting trouble with setting devices or products. Be brief in your answers.\
// Answer ONLY with the facts listed in the list of sources below. If there isn't enough information below, say you don't know.\
// Do not generate answers that don't use the sources below or not related to Advantefch.\
// If asking a clarifying question to the user would help, ask the question.\
// For tabular information return it as an html table. Do not return markdown format.\
// Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response. Use square brackets to reference the source, e.g. [info1.txt]. Don't combine sources, list each source separately, e.g. [info1.txt][info2.pdf].\
// {follow_up_questions_prompt}\
// Sources:\
// {sources}\
// <|im_end|>\
// {chat_history}";

const prompt_chat_new =
"You are an online customer service and Your target is to help customers troubleshoot issues related to products, setting up devices or problems they are facing issues with. \
Be concise and clear in your answers and the focus is on providing accurate and factual answers based on the information available in the listed sources.\
If there is not enough information from the provided sources, ask the question to user for more information.\
\
Reply format requirements:\
1. Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response. Use square brackets to reference the source, e.g. [info1.txt]. Don't combine sources, list each source separately, e.g. [info1.txt][info2.pdf].\
2. For tabular information return it as an html table. Do NOT return markdown format, e.g. **hello** or # heading1.\
3. Reply in the language of the question, however some specific words like product names or menu name can be in English.\
4. If question is Chinese, please respond in Taiwanese phrasing and cultural style, including word choice, idioms, and traditional characters unique to Taiwan.\
5. Please answer in a 'humane tone', if needed, please reply in list format, e.g. 1. xxx 2. xxx 3. xxx\
{follow_up_questions_prompt}\
Sources:\
{sources}\
<|im_end|>\
{chat_history}";

var count = 0;
var history = [];
axios.defaults.baseURL = "http://127.0.0.1:5000"//"https://advantech-intern-chatbot-api.azurewebsites.net";//"http://localhost:5000";

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
      console.log("=== count ===", count);
      if (count === 0) {
        console.log("=== botStart ===");
        this.botTyping = true;
        setTimeout(() => { }, 1000);
        setTimeout(() => {
          this.botTyping = false;
          this.inputDisable = false;
          this.data.push({
            agent: "bot",
            type: "text",
            text: "Hello"
          });
        }, 1000);
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
      // this.chat(value["text"]);
      this.chat_test(value["text"]);
    },

    chat(query) {
      console.log("=== chat ===");
      this.inputDisable = true;
      this.botTyping = true;

      // for (let i = 1; i < this.data.length; i += 2) {
      //   console.log(this.data[i].text, this.data[i + 1].text);
      //   var h = {
      //     user: this.data[i].text,
      //     bot: this.data[i + 1].text
      //   };
      //   history.push(h);
      // }

      if (history.length > 5) {
        history = history.slice(-5);
      }
      history.push({
        user: query
      });

      console.log(axios.defaults.baseURL)
      axios.post("/chat", {
        history: history,
        approach: "rrr",
        overrides: {
          top: 3,
          prompt_template: prompt_chat
        }

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
        
      },
        { headers: { "Content-Type": "application/json" } }
      ).then((response) => {
        console.log(">> response: ", response);
        // parsed_ans = response.data.answer.trim();
        // console.log('-----')
        const replyMessage = {
          agent: "bot",
          type: "text",
          text: response.data.answer,
          // options: [
          //   {
          //     text: 'View ticket',
          //     value: 'https://google.com',
          //     action: 'url'
          //   }
          // ]
        };
        history[history.length - 1]["bot"] = response.data.answer;

        this.data.push(replyMessage);

        // finish
        this.botTyping = false;
        this.inputDisable = false;
      });
    },

    chat_test(query) {
      console.log("=== chat ===");
      this.inputDisable = true;
      this.botTyping = true;

      if (history.length > 8) {
        history = history.slice(-8);
      }
      history.push({
        'user': query
      });

      console.log(axios.defaults.baseURL)
      axios.post("/chat", {
        history: history,
        approach: "rrr",
        overrides: {
          top: 3,
          prompt_template: prompt_chat_new
        }
      },
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
          
          messageService.createMessage(ans, response.data.data_points, citations).then((response) => {
            const replyMessage = {
              agent: "bot",
              ...response
            };
            this.data.push(replyMessage);
          });
        }
        else{
          messageService.createMessage(ans, response.data.data_points).then((response) => {
            const replyMessage = {
              agent: "bot",
              ...response
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

.qkb-mb-button-options__btn {
  font-size: 0.4rem;
}
</style>
