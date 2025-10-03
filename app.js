// app.js
const { useState, useMemo } = React;

function DataTable({ data }) {
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const columns = data[0] ? Object.keys(data[0]) : [];

  const handleSort = (column) => {
    setSortConfig((prev) => {
      if (prev.key === column) {
        return { key: column, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key: column, direction: "asc" };
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(row =>
      Object.entries(filters).every(([key, value]) =>
        row[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }
      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleClearView = () => {
    setFilters({});
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };

  if (!data.length) return null;

  return (
    <div>
      <div className="pagination-controls">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
      <div className="rows-per-page-controls" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
        <label>
          Rows per page:{" "}
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[5, 10, 20, 50, 100].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </label>
        <button type="button" className="clear-view-btn" onClick={handleClearView}>
          Clear View
        </button>
      </div>
      <div className="table-container">
        <table className="resizable-table">
          <thead>
            <tr>
              {columns.map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={sortConfig.key === key ? "sorted" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <div className="header-cell">
                    <span>
                      {key}
                      {sortConfig.key === key && (
                        <span className="sort-indicator">
                          {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                        </span>
                      )}
                    </span>
                    <input
                      type="text"
                      placeholder={`Filter ${key}`}
                      value={filters[key] || ""}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: "100%", marginTop: 6 }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx}>
                {columns.map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = function (evt) {
        const text = evt.target.result;
        const rows = text.split('\n').filter(Boolean);
        const headers = rows[0].split(',');
        const parsed = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h.trim()] = values[i] ? values[i].trim() : "");
          return obj;
        });
        setData(parsed);
      };
      reader.readAsText(file);
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1 className="csv-title">CSV Visualizer</h1>
      <div className="csv-file-controls">
        <label className="csv-file-label">
          Choose CSV
          <input
            type="file"
            accept=".csv"
            className="csv-file-input"
            onChange={handleFileUpload}
          />
        </label>
        {selectedFile && (
          <span className="csv-file-selected">{selectedFile.name}</span>
        )}
      </div>
      <DataTable data={data} />
    </div>
  );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));