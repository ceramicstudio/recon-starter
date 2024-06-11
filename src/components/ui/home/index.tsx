import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { type TrustType, type ConvertedType } from "@/types";
import useStore from "@/zustand/store";

const HomeShowcase: React.FC = () => {
  const [cred, setCred] = useState<string>(
    JSON.stringify({ "Generate Credentials Below": "👇" }, undefined, 2),
  );
  const [recipient, setRecipient] = useState<string>("");
  const [scope, setScope] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [reason, setReason] = useState<string[]>([]);
  const [reasons, setReasons] = useState<number>(0);
  const [trust, setTrust] = useState<TrustType[]>([]);
  const { compose } = useStore();

  const createCredential = async () => {
    if (!recipient) {
      alert("Please enter a recipient address");
      return;
    }
    if (!trust.length) {
      alert("Please enter at least one trustworthiness value");
      return;
    }
    const newTrust: ConvertedType[] = [];

    trust.map((i: TrustType) => {
      newTrust.push({
        scope: i.scope,
        level: parseFloat(i.level),
        reason: i.reason,
      });
    });

    const query = await compose.executeQuery<{
      setAccountTrustSignal: {
        document: {
          id: string;
          issuer: {
            id: string;
          };
          recipient: {
            id: string;
          };
          issuanceDate: string;
          trustWorthiness: TrustType;
        };
      };
    }>(`
      mutation {
        setAccountTrustSignal(input: {
          content: {
            recipient: "did:pkh:eip155:1:${recipient}"
            issuanceDate: "${new Date().toISOString()}"
            trustWorthiness: ${JSON.stringify(newTrust).replace(
              /"([^"]+)":/g,
              "$1:",
            )}
          }
        })
        {
          document {
            id
            issuer{
              id
            }
            recipient {
              id
            }
            issuanceDate
            trustWorthiness {
              level
              scope
              reason
            }
          }
        }
      }
    `);
    console.log(query);
    setCred(JSON.stringify(query, null, 2));
    setTrust([]);
    setRecipient("");
  };

  const createTrust = () => {
    if (!scope || !level) {
      alert("Please fill out all required fields");
      return;
    }
    setTrust([
      ...trust,
      {
        scope,
        level,
        reason,
      },
    ]);
    setScope("");
    setLevel("");
    setReason([]);
    setReasons(0);
  };

  return (
    <>
      <section className="relative  border-border bg-gradient-to-b from-background via-background via-90% to-transparent">
        <div className="max-w-xxl max-h-xxl min-h-500 mx-auto w-5/6">
          <TextareaAutosize
            className="h-full w-full resize-none rounded-md border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Credentials"
            value={cred}
            onChange={(e) => setCred(e.target.value)}
          />

          <div className="items-left mt-5 flex w-full flex-col justify-center">
            <p className="mt-5 text-white">1. Enter Recipient Eth Address: </p>
            <TextareaAutosize
              className="h-full w-1/2 resize-none rounded-md border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Recipient Eth address here"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <p className="mb-4 mt-5 text-white">
              2. Add Trustworthiness Values:{" "}
            </p>
            <p className="text-white">
              <small>
                a. Click &quot;Add Reason&quot; to add optional reason entries
              </small>
            </p>
            <p className="text-white">
              <small>
                b. Click &quot;Add Trustworthiness&quot; to create a
                Trustworthiness entry
              </small>
            </p>
            <p className="mb-4 text-white">
              <small>
                c. Click &quot;Issue Credential&quot; when you have added 1 or
                more Trustworthiness entries
              </small>
            </p>
            <div className=" flex h-full w-full flex-col">
              <TextareaAutosize
                className="mb-4 h-full w-1/2 resize-none rounded-md border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scope (e.g. 'Honesty') - REQUIRED"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              />
              <TextareaAutosize
                className="mb-4 h-full w-1/2 resize-none rounded-md border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Level (e.g. 0.5) - REQUIRED"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
              {reasons > 0 && (
                <div className="items-left mt-5 flex w-full flex-col justify-center">
                  {reasons >= 1 &&
                    Array.from(Array(reasons).keys()).map((i) => {
                      return (
                        <TextareaAutosize
                          key={i}
                          className="h-full w-1/2 resize-none rounded-md border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Reason ${i} (e.g. 'Alumnus')`}
                          value={reason[i]}
                          onChange={(e) => {
                            const temp = [...reason];
                            temp[i] = e.target.value;
                            setReason(temp);
                          }}
                        />
                      );
                    })}
                </div>
              )}
              <button
                onClick={() => {
                  setReasons(reasons + 1);
                }}
                className="mr-3 mt-2 h-10 w-1/5 rounded-md text-white outline outline-2 hover:bg-blue-800"
              >
                Add Reason
              </button>
            </div>
            <button
              onClick={() => {
                {
                  createTrust();
                }
              }}
              className="mr-3 mt-5 h-10 w-1/5 rounded-md text-white outline outline-2 hover:bg-blue-800"
            >
              Add Trustworthiness
            </button>
            {trust.length > 0 &&
              trust.map((i) => {
                return (
                  <div
                    className="items-left m-2 flex flex-col justify-center space-y-1 border-2 border-indigo-500/100 p-3"
                    key={i.scope}
                  >
                    <p className="text-white">Scope: {i.scope}</p>
                    <p className="text-white">Level: {i.level}</p>
                    {i.reason?.length &&
                      i.reason.map((r) => {
                        return (
                          <p className="text-white" key={r}>
                            Reason: {r}
                          </p>
                        );
                      })}
                  </div>
                );
              })}
          </div>
          {trust.length > 0 && (
            <button
              onClick={() => {
                {
                  void createCredential();
                }
              }}
              className="mr-3 mt-5 h-10 w-1/4 rounded-md text-white outline outline-2 hover:bg-blue-800"
            >
              Issue Credential
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default HomeShowcase;
