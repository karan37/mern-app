import React, { useState, useEffect } from 'react';
import { Table, Modal, message, Typography } from 'antd';
import { useQuery, gql } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import Logout from '../LogoutButton';

// GraphQL query to fetch job listings
export const GET_JOB_LISTINGS = gql`
  query GetJobListings {
    jobListings {
      id
      jobTitle
      companyName
      jobType
      jobLevel
      jobGeo
      jobIndustry
      salaryCurrency
    }
  }
`;

const { Title } = Typography;

const ListingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [rows, setRows] = useState(10);
  const { isPaidUser, user } = useAuth();
  const { data, loading, error } = useQuery(GET_JOB_LISTINGS);

  useEffect(() => {
    if (error) {
      message.error('Failed to fetch job listings');
    }
  }, [error]);

  const handleRowClick = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Job Title', dataIndex: 'jobTitle', key: 'title' },
    { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Job Type', dataIndex: 'jobType', key: 'jobType' },
    { title: 'Job Level', dataIndex: 'jobLevel', key: 'jobLevel' },
  ];

  return (
    <>
      <div>
        <Title level={2} className="float-left">
          Welcome to the job board{' '}
          <span className="text-main-blue">{user?.name}</span>!
        </Title>
        <Logout className="float-right mt-1" />
      </div>
      <Table
        dataSource={data?.jobListings || []}
        loading={loading}
        columns={columns}
        rowKey="id"
        className="[&_.ant-table-thead_th]:!bg-main-blue [&_.ant-table-thead_th]:!text-white"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer',
        })}
        scroll={{ y: 'calc(100vh - 200px)' }}
        pagination={{
          pageSize: rows,
          pageSizeOptions: isPaidUser ? ['10', '20', '50'] : ['10'], // Options for Paid User, default to 10 for Free Users
          showSizeChanger: isPaidUser, // Allow only Paid Users to change page size
          onChange: (page, pageSize) => setRows(pageSize || 10),
        }}
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'bg-gray-300' : 'bg-gray-200'
        }
      />
      {selectedJob && (
        <Modal
          title={
            isPaidUser ? 'Job Details' : 'Feature Not Available For Free Users'
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <p>
            <strong>Job Geo:</strong>{' '}
            {isPaidUser ? selectedJob.jobGeo : '?????'}
          </p>
          <p>
            <strong>Salary Currency:</strong>{' '}
            {isPaidUser ? selectedJob.salaryCurrency : '?????'}
          </p>
          <p>
            <strong>Job Industry:</strong>{' '}
            {isPaidUser ? selectedJob.jobIndustry.join(', ') : '?????'}
          </p>
        </Modal>
      )}
    </>
  );
};

export default ListingPage;
