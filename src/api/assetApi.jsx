import { supabase } from "../supabase.js";

// 카테고리 목록 불러오기
export const getCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return data;
};

// 자산 목록 불러오기
export const getAssets = async () => {
  const { data, error } = await supabase.from("assets").select("*");
  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    ...item.data, // data 필드 펼침
  }));
};

// 카테고리 추가
export const addCategory = async (category) => {
  const { error } = await supabase.from("categories").insert([category]);
  if (error) throw error;
};

// 자산 추가
export const addAsset = async (asset) => {
  const { id, categoryId, ...data } = asset;
  const { error } = await supabase.from("assets").insert([
    {
      id,
      categoryId,
      data, // 나머지 필드 통째로 data로 저장
    },
  ]);
  if (error) throw error;
};

// 자산 수정
export const saveAsset = async (asset) => {
  const { id, categoryId, ...data } = asset;
  const { error } = await supabase
    .from("assets")
    .update({ categoryId, data })
    .eq("id", id);
  if (error) throw error;
};

// 자산 삭제
export const deleteAsset = async (id) => {
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw error;
};

// 카테고리 삭제
export const deleteCategory = async (id) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
};
