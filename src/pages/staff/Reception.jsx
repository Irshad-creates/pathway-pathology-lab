const Reception = () => {
  const navStyle = `
    .nav-item {
      font-size: 15px;
      padding: 6px 10px;
      cursor: pointer;
      display: inline-block;
      vertical-align: middle;
      position: relative;
      white-space: nowrap;
    }

    .nav-item:hover {
      background: #3b82f6;
    }

    .active {
      background: #ffffff;
      color: #000;
      font-weight: bold;
    }

    .dropdown-menu {
      display: none;
      position: absolute;
      top: 32px;
      left: 0;
      background: white;
      color: black;
      border: 1px solid #999;
      min-width: 220px;
      z-index: 1000;
    }

    .dropdown-menu div {
      padding: 6px 8px;
      border-bottom: 1px solid #ddd;
    }

    .dropdown-menu div:hover {
      background: #f0f0f0;
    }

    .dropdown:hover .dropdown-menu {
      display: block;
    }
  `;

  const inputStyle = {
    height: "22px",
    width: "100%",
    border: "1px solid #000",
    paddingLeft: "4px",
    fontSize: "14px",
  };

  const selectStyle = {
    height: "22px",
    border: "1px solid #000",
    fontSize: "14px",
  };

  return (
    <div style={{ fontSize: "14px", background: "#eaeaea", minHeight: "100vh" }}>
      <style>{navStyle}</style>

      {/* ================= TOP HEADER ================= */}
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{ background: "#f7f7f7", borderBottom: "1px solid #999" }}
      >
        <tbody>
          <tr style={{ height: "40px" }}>
            <td style={{ paddingLeft: "10px" }}>
              <input
                placeholder="Search by Name, Labcode, Mobile, Aadhar Number"
                style={{
                  height: "22px",
                  width: "300px",
                  fontSize: "12px",
                  paddingLeft: "6px",
                  border: "2px solid black",
                }}
              />
            </td>

            <td
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1e40af",
              }}
            >
              Pathway Pathology Lab
            </td>

            <td style={{ paddingRight: "20px", textAlign: "right" }}>
              <span style={{ marginRight: "10px" }}>ASHISH_SAHU1</span>
              <span style={{ marginRight: "10px" }}>🔔</span>
              <span
                style={{
                  border: "1px solid #666",
                  padding: "2px 6px",
                  background: "#e6ffe6",
                  borderRadius: "4px",
                }}
              >
                OPEN
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= NAVBAR ================= */}
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{
          background: "linear-gradient(#2f5fa7, #1e3a8a)",
          color: "white",
          borderBottom: "1px solid #000",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr style={{ height: "40px" }}>
            <td
              style={{
                paddingLeft: "10px",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
              }}
            >
              <span className="nav-item active">Search</span>
              <span className="nav-item">Test Registration</span>

              <span className="nav-item dropdown">
                Administration ▾
                <div className="dropdown-menu">
                  <div>Change Password</div>
                </div>
              </span>

              <span className="nav-item dropdown">
                Device Request ▾
                <div className="dropdown-menu">
                  <div>Pickup Request Page</div>
                  <div>Patient Appointment</div>
                  <div>Message To Lab</div>
                  <div>Scheduler</div>
                  <div>Trip Management</div>
                  <div>Test Result Batch</div>
                </div>
              </span>

              <span className="nav-item">Help</span>

              <span style={{ marginLeft: "20px" }}>
                +91-8975273383 | +91-9146188320
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= PATIENT DETAILS ================= */}
      <div style={{ padding: "6px" }}>
        <div
          style={{
            color: "#1e40af",
            fontWeight: "bold",
            marginBottom: "4px",
            fontSize: "16px",
          }}
        >
          Test Registration
        </div>

        <table
          width="100%"
          cellPadding="3"
          cellSpacing="0"
          style={{
            background: "#ffffff",
            border: "1px solid #999",
            fontSize: "16px",
          }}
        >
          <tbody>
            <tr>
              <td>Patient Type</td>
              <td>
                <select style={selectStyle}>
                  <option>O.P.D.</option>
                </select>
              </td>

              <td>Patient ID</td>
              <td>
                <input style={inputStyle} />
              </td>

              <td>Lab Code</td>
              <td>
                <input style={{ ...inputStyle, background: "#fff9c4" }} />
              </td>

              <td>Registration Date</td>
              <td>
                <input style={{ ...inputStyle, background: "#fff9c4" }} />
              </td>
            </tr>

            <tr>
              <td>Patient Name *</td>
              <td colSpan="3">
                <select style={selectStyle}>
                  <option>Mr</option>
                  <option>Ms</option>
                </select>
                <input
                  style={{
                    ...inputStyle,
                    width: "70%",
                    marginLeft: "4px",
                    background: "#fff9c4",
                  }}
                />
              </td>

              <td>Age</td>
              <td>
                <input
                  style={{
                    ...inputStyle,
                    width: "50px",
                    background: "#fff9c4",
                  }}
                />
                <select style={{ ...selectStyle, marginLeft: "4px" }}>
                  <option>Yr</option>
                </select>
              </td>

              <td>Date of Birth</td>
              <td>
                <input style={inputStyle} />
              </td>
            </tr>

            <tr>
              <td>Gender</td>
              <td colSpan="3">
                <label><input type="radio" /> Male</label>
                <label style={{ marginLeft: "10px" }}>
                  <input type="radio" /> Female
                </label>
                <label style={{ marginLeft: "10px" }}>
                  <input type="radio" /> None
                </label>
              </td>

              <td>Email</td>
              <td>
                <input style={inputStyle} />
              </td>

              <td>Mobile Number</td>
              <td>
                <input style={inputStyle} />
              </td>
            </tr>

            <tr>
              <td>Address</td>
              <td colSpan="3">
                <input style={inputStyle} />
              </td>

              <td>City</td>
              <td>
                <input style={inputStyle} />
              </td>

              <td>Doctor Name</td>
              <td>
                <input style={{ ...inputStyle, background: "#fff9c4" }} />
              </td>
            </tr>

            <tr>
              <td>Is Register</td>
              <td><input type="checkbox" /></td>

              <td>Home Collection</td>
              <td><input type="checkbox" /></td>

              <td>Sample Collected At</td>
              <td colSpan="3">
                <select style={{ ...selectStyle, width: "100%" }}>
                  <option>Lab</option>
                  <option>Clinic</option>
                </select>
              </td>
            </tr>

            <tr>
              <td>Collection Date</td>
              <td>
                <input style={{ ...inputStyle, background: "#fff9c4" }} />
              </td>
              <td colSpan="6"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reception;
