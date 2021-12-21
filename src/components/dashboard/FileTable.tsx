import React, { useEffect, useState } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { defaultVariant } from "../../lib/clientConstants";
import Navigation from "./table/Navigation";
import { ApiError, fetch, FileStats, getCancelToken } from "../../lib";
import type { AxiosError, CancelToken } from "axios";
import Image from "next/image";
import moment from "moment";

const carrotButtonVariants: Variants = {
	init: {
		transform: "rotate(0deg)",
		...defaultVariant
	},
	animation: {
		transform: "rotate(90deg)",
		...defaultVariant
	}
};

const tableVariants: Variants = {
	init: {
		height: 0,
		...defaultVariant
	},
	animation: {
		height: 175,
		...defaultVariant
	}
};

const Statistics: React.FC = () => {
	const [open, setOpen] = useState(true);
	const controller = useAnimation();

	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);

	const [sort, setSort] = useState("default");
	const [query, setQuery] = useState("");

	const [files, setFiles] = useState<FileStats[]>([]);

	const fetchFiles = (token?: CancelToken | undefined) => {
		const path = `/api/files/search?page=${page}&sortType=${sort}&search=${encodeURIComponent(query ?? "")}`;
		fetch<{ pages: FileStats[]; length: number }>(path, token)
			.then((res) => {
				setPages(res.data.length);
				setFiles(
					res.data.pages.map((file) => ({
						...file,
						date: `${moment(file.date).format("DD/MM/YYYY HH:mm:ss")}`
					}))
				);
			})
			.catch(() => void 0);
	};

	useEffect(() => {
		const { token, cancel } = getCancelToken();
		fetchFiles(token);

		return () => cancel("Cancelled");
	}, [page, sort]);

	const getFileLink = (id: string, api = true) => `${api ? process.env.NEXT_PUBLIC_DOMAIN : `${location.protocol}//${location.host}`}/file/${id}`;

	const deleteFile = async (name: string) => {
		setFiles(files.filter((file) => file.name !== name));

		try {
			await fetch(`/api/file/${name}`, undefined, { method: "DELETE" });
			// success("File deleted!", `Successfully deleted file: ${name}`);
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			// alert("Could not delete the file", `${err.response?.data.message ?? "Unknown cause"}`);
		}

		fetchFiles();
		// fetchStats();
	};

	const getPreview = (type: string, url: string) => {
		// eslint-disable-next-line prefer-destructuring
		type = type.split("/")[0];
		switch (type) {
			case "image":
				return <Image alt="" className="dashboard__table-preview" src={url} width={100} />;
			case "video":
				return <video className="dashboard__table-preview" controls src={url} />;
			default:
				return <i className="fas fa-file no-preview dashboard__table-preview" />;
		}
	};

	const toggleOpen = () => {
		const _open = !open;
		setOpen(_open);

		controller.stop();
		if (_open) void controller.start("animation");
		else void controller.start("init");
	};

	return (
		<div className="dashboard-table">
			<div className="dashboard-table-title">
				<motion.button onClick={toggleOpen} variants={carrotButtonVariants} initial="init" animate={controller}>
					<i className="fas fa-chevron-right" />
				</motion.button>
				<h1>Files</h1>
			</div>
			<motion.div className="dashboard-table-items" variants={tableVariants} initial="init" animate={controller}>
				<Navigation {...{ setQuery, setPage, setSort, fetchItems: fetchFiles, page, pages }} />
			</motion.div>
		</div>
	);
};

export default Statistics;
