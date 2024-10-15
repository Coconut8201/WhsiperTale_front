// back_port = 7943;

export const enum apis {
    // //dev
    // startStory = `http://localhost:7943/story/startstory`,
    // GetStoryList = `http://localhost:7943/story/getstorylist_fdb`,
    // LLMGenStory = `http://localhost:7943/story/llm/genstory`,
    // GenImagePrompt = `http://localhost:7943/story/llm/genimageprompt`,
    // GetVoice = `http://localhost:7943/story/voice/take_voice`,
    // GetNewaudio = `http://163.13.202.120:9880`,
    // getAllSDModel = `http://163.13.202.120:7860/sdapi/v1/sd-models`,
    // uploadVoice = `http://localhost:7943/voice/uploadvoices`,
    // userLogin = "http://localhost:7943/user/login",
    // userRegister = "http://localhost:7943/user/adduser"
    // getVoiceList = "http://localhost:7943/voiceset/getVoiceList",



    // //use
    // startStory = `http://163.13.202.120:7943/story/startstory`,
    // GetStoryList = `http://163.13.202.120:7943/story/getstorylist_fdb`,
    // LLMGenStory = `http://163.13.202.120:7943/story/llm/genstory`,
    // GenImagePrompt = `http://163.13.202.120:7943/story/llm/genimageprompt`,
    // GetVoice = `http://163.13.202.120:7943/story/voice/take_voice`,
    // GetNewaudio = `http://163.13.202.120:9880`,
    // getAllSDModel = `http://163.13.202.120:7860/sdapi/v1/sd-models`,
    // uploadVoice = `http://163.13.202.120:7943/voice/uploadvoices`,

    // userLogin = "http://163.13.202.120:7943/user/login",
    // userRegister = "http://163.13.202.120:7943/user/adduser"



    // using in Nginx
    startStory = `https://163.13.202.120/api/story/startstory`,
    GetStoryList = `https://163.13.202.120/api/story/getstorylist_fdb`,
    LLMGenStory = `https://163.13.202.120/api/story/llm/genstory`,
    GenImagePrompt = `https://163.13.202.120/api/story/llm/genimageprompt`,
    GetVoice = `https://163.13.202.120/api/story/voice/take_voice`,
    GetNewaudio = `https://163.13.202.120/audio`,
    getAllSDModel = `https://163.13.202.120/sd/sdapi/v1/sd-models`,
    uploadVoice = `https://163.13.202.120/api/voice/uploadvoices`,
    userLogin = "https://163.13.202.120/api/user/login",
    userRegister = "https://163.13.202.120/api/user/adduser",
    getVoiceList = "https://163.13.202.120/api/voiceset/getVoiceList",

}