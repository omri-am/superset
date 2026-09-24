import { Trans, useLingui } from "@lingui/react/macro";
import { errorMessage } from "@superset/i18n/errors";
import { toast } from "@superset/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@superset/ui/tooltip";
import { cn } from "@superset/ui/utils";
import { useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import { electronTrpc } from "renderer/lib/electron-trpc";

interface OpenAllPullRequestsButtonProps {
	urls: string[];
	isCollapsed: boolean;
}

export function OpenAllPullRequestsButton({
	urls,
	isCollapsed,
}: OpenAllPullRequestsButtonProps) {
	const { t } = useLingui();
	const [isOpening, setIsOpening] = useState(false);
	const openUrl = electronTrpc.external.openUrl.useMutation();

	const handleOpen = async () => {
		setIsOpening(true);
		try {
			const results = await Promise.allSettled(
				urls.map((url) => openUrl.mutateAsync(url)),
			);
			const failure = results.find((result) => result.status === "rejected");
			if (failure?.status === "rejected")
				toast.error(errorMessage(failure.reason));
		} finally {
			setIsOpening(false);
		}
	};

	return (
		<Tooltip delayDuration={700}>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={t({ message: "Open all PRs in browser" })}
					disabled={urls.length === 0 || isOpening}
					onClick={handleOpen}
					className={cn(
						"mx-2 mb-1 flex h-8 shrink-0 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-fill-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
						isCollapsed && "justify-center px-0",
					)}
				>
					<LuExternalLink className="size-4 shrink-0" />
					{!isCollapsed && <Trans>Open all PRs</Trans>}
				</button>
			</TooltipTrigger>
			<TooltipContent side="right">
				<Trans>Open all PRs in browser</Trans>
			</TooltipContent>
		</Tooltip>
	);
}
