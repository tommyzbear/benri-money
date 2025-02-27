import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { ProfileImgMask } from "@/components/profile/profile-img-mask";
import { TransactionHistory } from "@/types/data";
import { CheckCheck } from "lucide-react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { blo } from "blo";
import { config } from "@/lib/wallet/config";
interface TransactionCardProps {
    tx: TransactionHistory;
    userId?: string;
    index: number;
}

export function TransactionCard({ tx, userId, index }: TransactionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
                window.open(
                    config.chains.find((chain) => chain.id === tx.chain_id)?.blockExplorers.default?.url + "/tx/" + tx.tx,
                    "_blank"
                );
            }}
            className="h-24 p-5 flex items-center justify-start bg-white  border-0 cursor-pointer
                     hover:bg-slate-50 transition-colors duration-200 shadow-none"
        >
            <div className="w-auto h-full py-1 relative">
                <ProfileImgMask
                    imageUrl={blo(tx.from_account_id as `0x${string}`)}
                    fill="hsl(var(--primary-foreground))"
                    className="antialiased opacity-85"
                />
                <div
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-5 w-5",
                        "-left-2 rounded-full p-1 shadow-sm border",
                        "flex items-center justify-center",
                        tx.from_account_id === userId ? "bg-chart-3" : "bg-green-200"
                    )}
                >
                    {tx.from_account_id === userId ? (
                        <PaperPlaneTilt size={20} weight="fill" className="text-red-500" />
                    ) : (
                        <CheckCheck className="w-4 h-4 text-green-500" />
                    )}
                </div>
            </div>
            <div className="ml-5 flex-1 min-w-0 space-y-1 font-roboto">
                <h3 className="text-xl font-bold break-all line-clamp-2">
                    {tx.from_account_id === userId ? tx.to_username : tx.from_username}
                </h3>
                <div className="flex flex-row justify-between items-center text-base">
                    <p className="text-muted-foreground">
                        {tx.from_account_id === userId ? "you sent" : "you received"}{" "}
                    </p>
                    <p className="text-muted-foreground font-bold tracking-tight">
                        {tx.from_account_id === userId ? "-" : "+"}
                        {formatUnits(BigInt(tx.amount), tx.decimals)} {tx.token_name}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
