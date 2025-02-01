// import React, { useEffect } from "react";
// import "amazon-connect-streams";

// const AmazonConnectOutboundCall: React.FC = () => {
//   const ccpUrl = "https://testingenv.my.connect.aws/connect/ccp-v2"; // Replace with your CCP URL
//   const awsRegion = "ca-central-1"; // Replace with your AWS region (e.g., "us-east-1")

//   useEffect(() => {
//     try {
//       // Initialize the CCP on component mount
//       connect.core.initCCP(document.getElementById("ccp-container")!, {
//         ccpUrl,
//         loginPopup: false,
//         region: awsRegion,
//       });

//       console.log(">>>>> CCP Initialized");
//     } catch (error) {
//       console.log(">>>>> CCP Initialized error: ", error);
//     }
//   }, []);

//   const makeOutboundCall = (phoneNumber: string) => {
//     try {
//       connect.agent(function (agent) {
//         if (agent) {
//           agent.onRefresh(() => {
//             console.log(">>>>> Agent data refreshed");
//           });

//           agent.connect(connect.Endpoint.byPhoneNumber(phoneNumber), {
//             success: function () {
//               console.log(">>>>> outbound call connected");
//             },
//             failure: function (err) {
//               console.log(">>>>> outbound call connection failed");
//               console.log(err);
//             },
//           });
//           console.log(`>>>>> Initiating call to: ${phoneNumber}`);
//         } else {
//           console.error(
//             ">>>>> Agent instance not found. Ensure CCP is initialized correctly.",
//           );
//         }
//       }); // Fetch the agent instance
//     } catch (error) {
//       console.log(">>>>> MakeCall error: ", error);
//     }
//   };

//   return (
//     <div>
//       <div id="ccp-container" style={{ display: "none" }}></div>
//       <button
//         onClick={() => makeOutboundCall("+16047817957")} // Replace with the desired phone number
//       >
//         Make Outbound Call
//       </button>
//     </div>
//   );
// };

// export default AmazonConnectOutboundCall;
