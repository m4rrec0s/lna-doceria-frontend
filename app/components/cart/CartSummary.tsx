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

    let message = `🍰 *NOVO PEDIDO - LNA CONFEITARIA*\n\n`;

    message += `━━━━━━━━━━━━━━━\n`;
    message += `🛍️ *ITENS DO PEDIDO*\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;

    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;

      const discountedTotal = item.discount
        ? itemTotal - (itemTotal * item.discount) / 100
        : itemTotal;

      message += `*${index + 1}. ${item.name}*\n`;

      // Quantidade
      if (item.packageInfo) {
        message += `📦 ${item.quantity} pacote(s) • ${item.packageInfo.packageSize} un. cada\n`;
      } else {
        message += `📦 ${item.quantity} unidade(s)\n`;
      }

      // Sabores
      if (item.selectedFlavors && item.selectedFlavors?.length > 0) {
        message += `🍬 Sabores:\n`;

        item.selectedFlavors.forEach((flavor) => {
          message += `   • ${flavor.name}\n`;
        });
      }

      // Preço unitário
      message += `💵 Unitário: ${formatCurrency(item.price)}\n`;

      // Desconto
      if (item.discount) {
        message += `🏷️ Desconto: ${item.discount}%\n`;
      }

      // Total item
      message += `✨ Total: *${formatCurrency(discountedTotal)}*\n`;

      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━\n`;
    message += `📄 *RESUMO*\n`;
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
    <div
      className={`
      rounded-3xl
      bg-white
      p-5
      shadow-sm
      ${className}
    `}
    >
      <div className="space-y-5">
        {/* HEADER */}
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Resumo do Pedido
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Confira os valores antes de finalizar
          </p>
        </div>

        {/* VALUES */}
        <div className="space-y-3 border-y border-zinc-100 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Subtotal</span>

            <span className="text-sm font-medium text-zinc-900">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {hasDiscount && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Descontos</span>

              <span className="text-sm font-semibold text-emerald-600">
                -{formatCurrency(totalDiscount)}
              </span>
            </div>
          )}
        </div>

        {/* TOTAL */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-500">Total</p>

            <h3 className="text-3xl font-bold tracking-tight text-rose-900">
              {formatCurrency(total)}
            </h3>
          </div>

          {hasDiscount && (
            <div className="rounded-full bg-emerald-50 px-3 py-1">
              <span className="text-xs font-semibold text-emerald-600">
                Economia de {formatCurrency(totalDiscount)}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          disabled={items.length === 0}
          onClick={handleFinishPurchase}
          className="
          h-12
          w-full
          rounded-2xl
          bg-rose-900
          text-sm
          font-semibold
          text-white
          transition-all
          duration-200
          hover:bg-rose-800
          hover:shadow-lg
          active:scale-[0.98]
        "
        >
          <ShoppingBag size={18} className="mr-2" />
          Finalizar Pedido
        </Button>

        {/* INFO */}
        <p className="text-center text-xs leading-relaxed text-zinc-400">
          Ao finalizar, seu pedido será enviado diretamente para nosso WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
