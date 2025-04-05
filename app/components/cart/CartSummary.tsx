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

    let message = "🍰 *Novo Pedido - LNA Confeitaria* 🍰\n\n";
    message += "*Itens do Pedido:*\n";

    items.forEach((item, index) => {
      // Cálculo correto do preço baseado no tipo de venda
      const itemTotal =
        item.sellingType === "package"
          ? item.price
          : item.price *
            (item.packageInfo ? item.packageInfo.totalUnits : item.quantity);

      const discountedTotal = item.discount
        ? itemTotal - (itemTotal * item.discount) / 100
        : itemTotal;

      message += `${index + 1}. *${item.name}*\n`;

      // Adicionar informações de quantidade e tipo
      if (item.packageInfo) {
        message += `   - ${item.quantity} ${
          item.quantity > 1 ? "pacotes" : "pacote"
        } com ${item.packageInfo.packageSize} unidades cada\n`;
      } else {
        message += `   - ${item.quantity} ${
          item.quantity > 1 ? "unidades" : "unidade"
        }\n`;
      }

      // Adicionar informações sobre os sabores selecionados
      if (item.selectedFlavors && item.selectedFlavors.length > 0) {
        message += `   - Mix de sabores: ${item.selectedFlavors
          .map((f) => f.name)
          .join(", ")}\n`;
      } else if (item.flavorId) {
        message += `   - Sabor específico selecionado\n`;
      }

      message += `   - Valor unitário: ${formatCurrency(item.price)}\n`;

      if (item.discount) {
        message += `   - Desconto: ${item.discount}%\n`;
        message += `   - Valor sem desconto: ${formatCurrency(itemTotal)}\n`;
        message += `   - Valor com desconto: ${formatCurrency(discountedTotal)}\n`;
        message += `   - Economia: ${formatCurrency((itemTotal * item.discount) / 100)}\n`;
      } else {
        message += `   - Valor total: ${formatCurrency(itemTotal)}\n`;
      }

      message += "\n";
    });

    message += "\n*Resumo do Pedido:*\n";
    message += `Subtotal: ${formatCurrency(subtotal)}\n`;

    if (hasDiscount) {
      message += `Descontos: ${formatCurrency(totalDiscount)}\n`;
      message += `Economia total: ${formatCurrency(totalDiscount)}\n`;
    }

    message += `*Valor Total: ${formatCurrency(total)}*\n\n`;
    message += "Por favor, confirme meu pedido! 😊";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/558388511950?text=${encodedMessage}`, "_blank");
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
        className="w-full mt-2 bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-2"
      >
        <ShoppingBag size={18} />
        Finalizar Compra
      </Button>
    </div>
  );
};

export default CartSummary;
