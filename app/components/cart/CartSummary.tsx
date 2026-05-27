import React from "react";
import { Button } from "../ui/button";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../helpers/formatCurrency";
import { ShoppingBag } from "lucide-react";

interface CartSummaryProps {
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ className }) => {
  const { subtotal, totalDiscount, total, items } = useCart();
  const hasDiscount = totalDiscount > 0;

  const handleFinishPurchase = () => {
    if (items.length === 0) return;

    let message = `🍰 *NOVO PEDIDO - LNA DOCERIA*\n\n`;
    message += `━━━━━━━━━━━━━━━\n`;
    message += `*ITENS DO PEDIDO*\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;

    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const discountedTotal = item.discount
        ? itemTotal - (itemTotal * item.discount) / 100
        : itemTotal;

      message += `*${index + 1}. ${item.name}*\n`;

      if (item.packageInfo) {
        message += `${item.quantity} pacote(s) • ${item.packageInfo.packageSize} un. cada\n`;
      } else {
        message += `${item.quantity} unidade(s)\n`;
      }

      if (item.selectedFlavors && item.selectedFlavors.length > 0) {
        message += `Sabores:\n`;
        item.selectedFlavors.forEach((flavor) => {
          message += `   • ${flavor.name}\n`;
        });
      }

      message += `Unitário: ${formatCurrency(item.price)}\n`;

      if (item.discount) {
        message += `🏷️ Desconto: ${item.discount}%\n`;
      }

      message += `Total: *${formatCurrency(discountedTotal)}*\n\n`;
    });

    message += `━━━━━━━━━━━━━━━\n`;
    message += `*RESUMO*\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;
    message += `Subtotal: ${formatCurrency(subtotal)}\n`;

    if (hasDiscount) {
      message += `Descontos: -${formatCurrency(totalDiscount)}\n`;
    }

    message += `\n💰 *TOTAL FINAL: ${formatCurrency(total)}*\n\n`;
    message += `Obrigado! Aguardo a confirmação do pedido 😊`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/558388511950?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className={`bg-zinc-50/50 p-4 border-t border-zinc-100 ${className}`}>
      <div className="space-y-4">
        {/* VALUES MATRIX - TIGHTLY GROUPED */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span>Subtotal dos doces</span>
            <span className="font-semibold text-zinc-700">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {hasDiscount && (
            <div className="flex items-center justify-between text-emerald-600 font-medium">
              <span>Descontos promocionais</span>
              <span className="font-bold">
                -{formatCurrency(totalDiscount)}
              </span>
            </div>
          )}
        </div>

        {/* TOTAL VALUE COMPACT CONTAINER */}
        <div className="flex items-center justify-between border-t border-zinc-200/60 pt-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total a pagar</p>
            <h3 className="text-xl font-bold tracking-tight text-rose-950">
              {formatCurrency(total)}
            </h3>
          </div>

          {hasDiscount && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 animate-pulse">
              <span className="text-[9px] font-bold text-emerald-700">
                Você economizou {formatCurrency(totalDiscount)}!
              </span>
            </div>
          )}
        </div>

        {/* COMPACT & CALLING CTA */}
        <div className="space-y-2">
          <Button
            disabled={items.length === 0}
            onClick={handleFinishPurchase}
            className="
              relative
              h-11
              w-full
              rounded-xl
              bg-rose-600
              text-xs
              font-bold
              text-white
              shadow-md
              hover:bg-rose-500
              hover:shadow-rose-600/10
              active:scale-[0.99]
              transition-all
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <ShoppingBag size={15} />
            Enviar Pedido pelo WhatsApp
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </Button>

          <p className="text-center text-[9px] font-medium leading-normal text-zinc-400">
            Você enviará este resumo diretamente para nosso atendente no WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
