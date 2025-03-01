import React from "react";
import { Button } from "../ui/button";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../helpers/formatCurrency";
import { ShoppingBag } from "lucide-react";

const CartSummary: React.FC = () => {
  const { subtotal, totalDiscount, total, items } = useCart();

  const hasDiscount = totalDiscount > 0;

  const handleFinishPurchase = () => {
    if (items.length === 0) return;

    // Formatar mensagem para o WhatsApp
    let message = "🍰 *Novo Pedido - LNA Confeitaria* 🍰\n\n";
    message += "*Itens do Pedido:*\n";

    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const discountedTotal = item.discount_percent
        ? itemTotal - (itemTotal * item.discount_percent) / 100
        : itemTotal;

      message += `${index + 1}. ${item.name}\n`;
      message += `   - Quantidade: ${item.quantity}\n`;
      message += `   - Valor unitário: ${formatCurrency(item.price)}\n`;

      if (item.discount_percent) {
        message += `   - Desconto: ${item.discount_percent}%\n`;
        message += `   - Valor total: ${formatCurrency(discountedTotal)}\n`;
      } else {
        message += `   - Valor total: ${formatCurrency(itemTotal)}\n`;
      }

      message += "\n";
    });

    message += "\n*Resumo do Pedido:*\n";
    message += `Subtotal: ${formatCurrency(subtotal)}\n`;

    if (hasDiscount) {
      message += `Descontos: ${formatCurrency(totalDiscount)}\n`;
    }

    message += `*Valor Total: ${formatCurrency(total)}*\n\n`;
    message += "Gostaria de continuar com este pedido? 😊";

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // Abrir link do WhatsApp
    window.open(`https://whatsss.link/krbtpl?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <div className="flex justify-between text-sm mb-2">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      {hasDiscount && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-pink-400">Descontos</span>
          <span className="text-pink-400">
            -{formatCurrency(totalDiscount)}
          </span>
        </div>
      )}

      <div className="flex justify-between text-base font-medium mt-4">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <Button
        disabled={items.length === 0}
        onClick={handleFinishPurchase}
        className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-2"
      >
        <ShoppingBag size={18} />
        Finalizar Compra
      </Button>
    </div>
  );
};

export default CartSummary;
