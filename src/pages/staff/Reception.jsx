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
    <div
      style={{ fontSize: "14px", background: "#eaeaea", minHeight: "100vh" }}
    >
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
          cellPadding="6"
          cellSpacing="4"
          style={{
            lineHeight: "1.4",
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
                <label>
                  <input type="radio" /> Male
                </label>
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
              <td>
                <input type="checkbox" />
              </td>

              <td>Home Collection</td>
              <td>
                <input type="checkbox" />
              </td>

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

      {/* ================= TEST SELECTION ================= */}
      <div style={{ padding: "6px", marginTop: "6px" }}>
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            background: "#ffffff",
            border: "1px solid #999",
            padding: "12px 10px",
            fontSize: "15px",
          }}
        >
          <tbody>
            {/* TOP SEARCH BAR */}
            <tr>
              <td
                colSpan="3"
                style={{
                  padding: "14px 12px",
                  borderBottom: "1px solid #999",
                }}
              >
                <label>Search By:</label>
                <select
                  style={{
                    height: "28px",
                    marginLeft: "6px",
                    border: "1px solid #000",
                  }}
                >
                  <option>Short Name</option>
                  <option>Display Name</option>
                </select>

                <input
                  placeholder="Select Test"
                  style={{
                    height: "28px",
                    width: "230px",
                    marginLeft: "6px",
                    border: "1px solid #000",
                    paddingLeft: "6px",
                  }}
                />

                <input
                  placeholder="Select Category"
                  style={{
                    height: "28px",
                    width: "210px",
                    marginLeft: "6px",
                    border: "1px solid #000",
                    paddingLeft: "6px",
                  }}
                />

                <textarea
                  placeholder="Enter Comment"
                  style={{
                    height: "70px",
                    width: "280px",
                    marginLeft: "10px",
                    border: "1px solid #000",
                    resize: "none",
                    padding: "6px",
                    verticalAlign: "top",
                  }}
                />
              </td>
            </tr>

            {/* HEADERS */}
            <tr>
              <td style={{ padding: "4px", fontWeight: "bold" }}>Test List</td>
              <td></td>
              <td style={{ padding: "4px", fontWeight: "bold" }}>
                Selected Test List &nbsp;&nbsp;
                <span style={{ fontWeight: "normal" }}>
                  Price | Discount | Refund
                </span>
              </td>
            </tr>

            {/* MAIN 3 COLUMN AREA */}
            <tr>
              {/* LEFT TEST LIST */}
              <td
                width="40%"
                style={{
                  borderRight: "1px solid #999",
                  verticalAlign: "top",
                  padding: "4px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #000",
                    height: "200px",
                    overflowY: "scroll",
                  }}
                >
                  {[
                    "-Erythropoietin (Erythropoietin)",
                    "-FLUID ROUTINE EXAMINATION (FLDR)",
                    "-IgG 4 Sub class (IgG 4 Sub class)",
                    "-Ovarian-Cancer marker profile (Cancer marker profile)",
                    "-PAPPA (PAPPa)",
                    "-BLOOD GROUP (BLG)",
                    "-BLOOD GLUCOSE FASTING & POST PRANDIAL (BSFPP)",
                    "-BLOOD GLUCOSE FASTING (BSFP)",
                    "-BLOOD GLUCOSE POST PRANDIAL (BSPP)",
                    "-BLOOD GLUCOSE RANDOM (BSR)",
                    "-BLOOD GLUCOSE RANDOM (BSR-C)",
                    "-BONE MARROW BIOPSY (BMB)",
                    "-URINARY ALBUMIN (URALB)",
                    "-URINARY CALCIUM (URCAL)",
                    "-URINARY PHOSPHORUS (URPHOS)",
                    "-URINARY PROTEIN (URPRT)",
                    "-URINARY PROTEIN/CREAT RATIO (PROCR)",
                    "-MALARIA ANTIGEN (MP)",
                    "-DENGUE NS1 ANTIGEN",
                    "-WIDAL TEST",
                    "-TYPHOID IgM",
                  ].map((test) => (
                    <div
                      key={test}
                      style={{
                        padding: "5px",
                        borderBottom: "1px solid #ddd",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#e6f0ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      {test}
                    </div>
                  ))}
                </div>
              </td>

              {/* CENTER BUTTONS */}
              <td
                width="20%"
                style={{
                  borderRight: "1px solid #999",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {["ADD >>", "ADD ALL >>", "<< REMOVE", "<< REMOVE ALL"].map(
                  (btn) => (
                    <button
                      key={btn}
                      style={{
                        width: "140px",
                        height: "30px",
                        marginBottom: "8px",
                        border: "1px solid #000",
                        background: "#f5f5f5",
                        cursor: "pointer",
                      }}
                    >
                      {btn}
                    </button>
                  )
                )}
              </td>

              {/* RIGHT SELECTED TEST LIST */}
              <td width="40%" style={{ padding: "4px", verticalAlign: "top" }}>
                <div
                  style={{
                    border: "1px solid #000",
                    height: "200px",
                    padding: "4px",
                  }}
                >
                  {/* Selected tests will be rendered here dynamically */}
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#777",
                      fontStyle: "italic",
                    }}
                  >
                    No tests selected
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= BILLING & PAYMENT ================= */}
      <div style={{ padding: "6px", marginTop: "6px" }}>
        <table
          width="100%"
          cellPadding="4"
          cellSpacing="0"
          style={{
            background: "#ffffff",
            border: "1px solid #999",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          <tbody>
            <tr>
              {/* LEFT DISCOUNT */}
              <td
                width="30%"
                style={{
                  verticalAlign: "top",
                  borderRight: "1px solid #ccc",
                  paddingRight: "6px",
                }}
              >
                <div>
                  <strong>Discount (Test)</strong> &nbsp; 0.00
                </div>

                <div style={{ marginTop: "6px" }}>
                  Discount (Regn)
                  <input
                    defaultValue="0.00"
                    style={{
                      width: "70px",
                      marginLeft: "6px",
                      border: "1.5px solid #333",
                    }}
                  />
                  <select
                    style={{
                      marginLeft: "4px",
                      border: "1.5px solid #333",
                    }}
                  >
                    <option>Amt</option>
                    <option>%</option>
                  </select>
                </div>

                <div style={{ marginTop: "8px" }}>
                  Reason
                  <select
                    style={{
                      width: "190px",
                      marginLeft: "18px",
                      border: "1.5px solid #333",
                    }}
                  >
                    {[
                      "DR REFERENCE",
                      "STAFF RELATIVE",
                      "HOSPITAL STAFF",
                      "LAB STAFF",
                      "CHARITABLE",
                    ].map((r) => (
                      <option
                        key={r}
                        style={{
                          background: "#1e40af",
                          color: "white",
                        }}
                      >
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: "8px" }}>
                  Authorisation
                  <select
                    style={{
                      width: "190px",
                      marginLeft: "2px",
                      border: "1.5px solid #333",
                    }}
                  >
                    <option>-SELECT AUTHORISED BY-</option>
                  </select>
                </div>
              </td>

              {/* RIGHT PAYMENT */}
              <td
                width="70%"
                style={{ verticalAlign: "top", paddingLeft: "8px" }}
              >
                {/* PAYMENT METHOD ROW */}
                <div>
                  <strong>Payment Method:</strong>
                  <label style={{ marginLeft: "10px" }}>
                    <input type="radio" defaultChecked /> Cash
                  </label>
                  <label style={{ marginLeft: "10px" }}>
                    <input type="radio" /> UPI
                  </label>

                  <span style={{ marginLeft: "20px" }}>
                    Bill Receipt No.
                    <input
                      style={{
                        width: "120px",
                        marginLeft: "6px",
                        border: "1.5px solid #333",
                      }}
                    />
                  </span>
                </div>

                {/* DIVIDER */}
                <hr style={{ margin: "8px 0", border: "0.5px solid #999" }} />

                {/* AMOUNT ROW */}
                <div style={{ fontSize: "12.5px", fontWeight: "600" }}>
                  <label>
                    <input type="checkbox" /> Urgency
                  </label>

                  {[
                    ["Total", "0.00"],
                    ["Visiting Charges", "0.00"],
                    ["Net Amount", "0.00"],
                    ["Paid", "0"],
                    ["Balance", "0.00"],
                    ["Refund Amount", "0.00"],
                    ["Recovery Amount", "0.00"],
                  ].map(([label, val]) => (
                    <span key={label} style={{ marginLeft: "12px" }}>
                      {label}
                      <input
                        defaultValue={val}
                        style={{
                          width: "65px",
                          marginLeft: "4px",
                          border: "1.5px solid #333",
                          fontWeight: "600",
                        }}
                      />
                    </span>
                  ))}
                </div>
              </td>
            </tr>

            {/* BUTTONS */}
            <tr>
              <td
                colSpan="2"
                style={{ textAlign: "center", paddingTop: "10px" }}
              >
                {["<< Test Search", "Save", "Proceed >>"].map((btn) => (
                  <button
                    key={btn}
                    style={{
                      width: "140px",
                      height: "34px",
                      marginRight: "10px",
                      background: "#2563eb",
                      color: "white",
                      border: "1px solid #1e40af",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#1e40af";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#2563eb";
                    }}
                  >
                    {btn}
                  </button>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reception;
