import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/popup/stores/wallet";
import { CheckIcon, ChevronDown, PlusCircleIcon } from "lucide-react";
import { FC, useState } from "react";

export const WalletSwitcher: FC = () => {
	const [open, setOpen] = useState(false);
	const current = useWalletStore((state) => state.current);
	const wallets = useWalletStore((state) => state.wallets);
	const setCurrent = useWalletStore((state) => state.setCurrent);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="w-40 justify-between overflow-hidden">
					{current?.name || "Select Wallet"}
					<ChevronDown className="ml-auto h-5 w-5 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0 ml-2">
				<Command>
					<CommandList>
						<CommandInput placeholder="Search team..." />
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading="Wallets">
							{(wallets || []).map((wallet) => (
								<CommandItem key={wallet?.url} className="text-sm" onSelect={() => setCurrent(wallet)}>
									{wallet.name}
									<CheckIcon
										className={cn(
											"ml-auto h-4 w-4 shrink-0",
											wallet.url === current?.url ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
					<CommandSeparator />
					<CommandList>
						<CommandGroup>
							<CommandItem>
								<PlusCircleIcon className="mr-2 h-5 w-5" />
								Create new
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};