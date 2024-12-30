export interface sdmodel{
    sd_name: string,
    show_name: string,
    image_path: string;
}

export const sdmodel_list: sdmodel[] = [
    { sd_name: "zbaseHighQualityAesthetic_sdxlV30.safetensors", show_name: "奇幻卡通風格", image_path: "src/images/Illustrious_Storybook_Landscapes_Animals.png"},  
    { sd_name: "realisticVisionV60B1_v51HyperVAE.safetensors [f47e942ad4", show_name: "寫實風格", image_path: "src/images/Realistic_Vision.png"},
    { sd_name: "AnythingV5V3_v5PrtRE.safetensors", show_name: "可愛卡通風格", image_path: "src/images/J_ill.png"},
    { sd_name: "sdXL_v10VAEFix.safetensors [e6bb9ea85b]", show_name: "卡通繪本風格", image_path: "src/images/StorybookRedmond.png"}, 
    { sd_name: "sdxlUnstableDiffusers_v11Rundiffusion.safetensors [dda8c0514c]", show_name: "手繪風格", image_path: "src/images/Storybook_Illustration_Style.png"},
    { sd_name: "sdXL_v10VAEFix.safetensors [e6bb9ea85b]", show_name: "立體卡通風格", image_path: "src/images/3dCartoon.png"},
]

export interface bookManageList {
    bookName: string,               // 顯示的書本名字
    bookId: string,                 // 書本id storyId
    bookFirstImageBase64: string    // 封面頁的圖片base64 code
}