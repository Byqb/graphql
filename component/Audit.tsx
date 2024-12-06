import React, { useState, useEffect } from 'react';
import { BarChartComponent } from './BarChartComponent';
import { fetchGraphQL, getUserIdFromCookie } from '../utils/api';

interface AuditInterface {
  grade: number;
}

export function Audit() {
  const [auditsDone, setAuditsDone] = useState<AuditInterface[] | null>(null);
  const [auditsReceived, setAuditsReceived] = useState<AuditInterface[] | null>(null);
  const [auditRatio, setAuditRatio] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAudits = async () => {
      const userID = getUserIdFromCookie();

      const query = `
      query getAudits($userID: Int!) {
        auditsReceived: audit(where: { auditorId: { _neq: $userID } }) {
          grade
        }
        auditsDone: audit(where: { auditorId: { _eq: $userID } }) {
          grade
        }

        xpUp: transaction_aggregate(where: { type: { _eq: "up" } }) {
          aggregate {
            sum {
              amount
            }
          }
        }
        xpDown: transaction_aggregate(where: { type: { _eq: "down" } }) {
          aggregate {
            sum {
              amount
            }
          }
        }
      }
    `;

      try {
        const data = await fetchGraphQL(query, { userID });
        if (
          data &&
          data.auditsDone &&
          data.auditsReceived &&
          data.xpUp &&
          data.xpDown
        ) {
          const auditsDone: AuditInterface[] = data.auditsDone.filter(
            (audit: AuditInterface) => audit.grade !== null
          );
          const auditsReceived: AuditInterface[] = data.auditsReceived.filter(
            (audit: AuditInterface) => audit.grade !== null
          );

          const xpReceived = data.xpUp.aggregate.sum.amount;
          const xpDone = data.xpDown.aggregate.sum.amount;
          const auditRatio = parseFloat((xpReceived / xpDone).toFixed(1));

          setAuditsDone(auditsDone);
          setAuditsReceived(auditsReceived);
          setAuditRatio(auditRatio);
        } else {
          setError("Could not fetch audit data");
        }
      } catch (err: any) {
        setError(
          err.message ||
            "An unexpected error occurred while fetching audit data"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudits();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Audit Information</h2>
      {isLoading && (
        <p className="text-gray-600 text-center text-lg font-semibold mb-2">
          Loading...
        </p>
      )}
      {error && (
        <p className="text-red-500 text-center text-lg font-semibold mb-2">{error}</p>
      )}
      {auditsDone && auditsReceived && auditRatio ? (
        <div className="text-center">
          <BarChartComponent
            auditsDone={auditsDone.length}
            auditsReceived={auditsReceived.length}
          />
          <h3 className="text-xl font-semibold mt-4 text-gray-700">
            Audit Ratio: {auditRatio}
          </h3>
        </div>
      ) : null}
    </div>
  );
}

