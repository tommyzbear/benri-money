import { formatEther } from "viem";
import { motion } from "framer-motion";
import { ProfileImgMask } from "@/components/profile/profile-img-mask";
import { TransactionHistory } from "@/types/data";

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
                    tx.chain === "Base Sepolia"
                        ? `https://sepolia.basescan.org/tx/${tx.tx}`
                        : `https://sepolia.etherscan.io/tx/${tx.tx}`,
                    "_blank"
                );
            }}
            className="h-28 p-5 flex items-center justify-start bg-white  border-0 cursor-pointer
                     hover:bg-slate-50 transition-colors duration-200 shadow-none"
        >
            <div className="w-auto h-full py-1">
                <ProfileImgMask fill="black" className="antialiased" />
                {/* <ProfileImgMask imageUrl={tx.from_profile_img} fill="black" /> */}
            </div>
            <div className="ml-5 flex-1 min-w-0 space-y-1">
                <h3 className="text-xl font-roboto font-bold break-all line-clamp-2">
                    {tx.from_account_id === userId ? tx.to_username : tx.from_username}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {tx.from_account_id === userId ? "you sent" : "you received"}{" "}
                    <b className="font-roboto font-black tracking-tight">
                        {formatEther(BigInt(tx.amount))}
                    </b>{" "}
                    {tx.token_name}
                </p>
            </div>
        </motion.div>
    );
}
