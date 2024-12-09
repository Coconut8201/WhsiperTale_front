export interface sdmodel{
    sd_name: string,
    show_name: string,
    image_path: string;
}

export const sdmodel_list: sdmodel[] = [
    {sd_name: "pastelMixStylizedAnime_pastelMixPrunedFP16.safetensors [d01a68ae76]", show_name: "水彩風格", image_path: "src/images/pastelMixStylizedAnime_pastelMixPrunedFP16.png"},
    {sd_name: "flux_dev.safetensors [4610115bb0]", show_name: "aa", image_path: "src/images/flux_dev.png"},
    {sd_name: "Pixel_Art_Diffusion_XL", show_name: "像素風格", image_path: "src/images/Pixel_Art_Diffusion_XL.png"},
    {sd_name: "flux_dev.safetensors [4610115bb0]", show_name: "可愛卡通風格", image_path: "src/images/picture_booksChildren_cartoon.jpeg"}, // <lora:children huiben11-20231007:1>

    { sd_name: 'rachelWalkerStyle_v1.ckpt [54ded95d83]', show_name: '水彩畫風格', image_path: '/src/images/rachelWalkerStyle_v1_image.jpeg' },
    { sd_name: 'splatterPunkXL_v10.safetensors [b5730102eb]', show_name: '賽博龐克風格', image_path: '/src/images/splatterPunkXL_v10_image.jpeg' },
    { sd_name: 'cartoonmix_v10.safetensors [730ecbe46a]', show_name: '3D卡通風格', image_path: '/src/images/cartoonmix_v10_image.jpeg' },
    { sd_name: 'disneyPixarCartoon_v10.safetensors', show_name: '皮克斯、迪士尼卡通風格', image_path: '/src/images/disneyPixarCartoon_v10_image.jpeg' },
    { sd_name: 'cuteCATCuteCitron_v2.safetensors [c75902b553]', show_name: 'Q版漫畫風格', image_path: '/src/images/cuteCATCuteCitron_v2_image.jpeg' },
    { sd_name: 'fantasyWorld_v10.safetensors', show_name: '奇幻風格', image_path: '/src/images/fantasyWorld_v10_image.jpeg' },
    { sd_name: 'flat2DAnimerge_v45Sharp.safetensors', show_name: '2D動漫風格', image_path: '/src/images/flat2DAnimerge_v45Sharp_image.jpeg' },
    { sd_name: `cemremixRealistic_v10Pruned.safetensors`, show_name: `真實感`, image_path: '/src/images/cemremixRealistic_v10Pruned_image.jpeg' },
    { sd_name: `handDrawnPortrait_v10.safetensors [e39b954453]`, show_name: `手繪`, image_path: '/src/images/handDrawnPortrait_v10_image.jpeg' },
    { sd_name: `paintersCheckpointOilPaint_v11.safetensors [4f9515f381]`, show_name: `油畫`, image_path: '/src/images/paintersCheckpointOilPaint_v11_image.jpeg' },
]