// ✅ src/pages/Main.jsx (Supabase 연동 버전)
import React, { useEffect, useState, useRef, useMemo } from "react";
import "../styles/Main.scss";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import ko from "../locale/ag-grid-locale-kr.json";
import {
  getCategories,
  getAssets,
  addCategory,
  addAsset,
  saveAsset,
  deleteAsset,
  deleteCategory,
} from "../api/assetApi";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Main = () => {
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const gridRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await getCategories();
        setCategories(categoryData);

        const assetData = await getAssets();
        setAssets(assetData);

        if (categoryData.length > 0) {
          const firstCategory = categoryData[0];
          setSelectedCategory(firstCategory);
          setupColumnDefs(firstCategory, assetData);
        }
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
      }
    };

    fetchData();
  }, []);

  const setupColumnDefs = (category, assetData) => {
    setColDefs(
      category.columns.map((col) => {
        if (category.id === "부식" && col === "수량") {
          return {
            field: col,
            editable: true,
            sortable: true,
            filter: true,
            cellStyle: (params) => {
              const totalQty = Number(params.data["총 수량"]);
              const currentQty = Number(params.value);
              if (currentQty < totalQty * 0.3) {
                return {
                  animation: "blink 1s infinite",
                  backgroundColor: "#ffcccc",
                  color: "red",
                  fontWeight: "bold",
                };
              }
              return null;
            },
          };
        }
        return {
          field: col,
          editable: true,
          sortable: true,
          filter: true,
        };
      })
    );

    setFilteredAssets(
      assetData.filter((asset) => asset.categoryId === category.id)
    );
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setupColumnDefs(category, assets);
  };

  const handleAddCategory = async () => {
    const name = prompt("카테고리 이름을 입력하세요:");
    if (!name) return;

    const columns = prompt("컬럼 이름을 쉼표로 구분해 입력하세요:").split(",");
    const newCategory = { id: name.toLowerCase(), name, columns };

    try {
      await addCategory(newCategory);
      setCategories((prev) => [...prev, newCategory]);
    } catch (error) {
      console.error("카테고리 추가 중 오류 발생:", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) {
      alert("삭제할 카테고리를 선택하세요.");
      return;
    }

    const confirmDelete = window.confirm(
      `정말로 "${selectedCategory.name}" 카테고리를 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      await deleteCategory(selectedCategory.id);
      setCategories((prev) =>
        prev.filter((category) => category.id !== selectedCategory.id)
      );
      setSelectedCategory(null);
      setFilteredAssets([]);
      setColDefs([]);
    } catch (error) {
      console.error("카테고리 삭제 중 오류 발생:", error);
    }
  };

  const handleAddRow = () => {
    if (!selectedCategory) {
      alert("카테고리를 먼저 선택하세요.");
      return;
    }

    const newRow = {
      id: null,
      categoryId: selectedCategory.id,
    };
    selectedCategory.columns.forEach((col) => {
      newRow[col] = "";
    });

    setFilteredAssets((prev) => [...prev, newRow]);
    setAssets((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = async () => {
    const selectedRows = gridRef.current.api.getSelectedRows();

    setFilteredAssets((prev) =>
      prev.filter((asset) => !selectedRows.includes(asset))
    );
    setAssets((prev) => prev.filter((asset) => !selectedRows.includes(asset)));

    try {
      await Promise.all(selectedRows.map((row) => deleteAsset(row.id)));
    } catch (error) {
      console.error("행 삭제 중 오류 발생:", error);
    }
  };

  const handleSave = async () => {
    const updatedAssets = [];
    gridRef.current.api.forEachNode((node) => updatedAssets.push(node.data));

    const toSupabaseFormat = (asset) => {
      const { id, categoryId, ...rest } = asset;
      return { id, categoryId, data: rest };
    };

    try {
      await Promise.all(
        updatedAssets.map((asset) => {
          if (!asset.id) {
            const id = crypto.randomUUID();
            return addAsset({ ...asset, id });
          } else {
            return saveAsset(asset);
          }
        })
      );
      alert("데이터 저장이 완료되었습니다.");
    } catch (error) {
      console.error("데이터 저장 중 오류 발생:", error);
    }
  };

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      editable: true,
      sortable: true,
    }),
    []
  );

  return (
    <div className="main">
      <div className="aside">
        <button onClick={handleAddCategory}>카테고리 추가</button>
        <button onClick={handleDeleteCategory}>카테고리 삭제</button>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>카테고리 목록</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={selectedCategory?.id === cat.id ? "active" : ""}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </AccordionDetails>
        </Accordion>
      </div>
      <div className="content">
        <div className="button-container">
          <button onClick={handleAddRow}>행 추가</button>
          <button onClick={handleDeleteRow}>행 삭제</button>
          <button onClick={handleSave}>저장</button>
        </div>
        <div
          className="ag-theme-quartz"
          style={{ height: "500px", width: "80vw" }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={filteredAssets}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            localeText={ko}
          />
        </div>
      </div>
    </div>
  );
};

export default Main;
