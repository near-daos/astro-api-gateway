package api.app.astrodao.com.core.dto.cli;

import api.app.astrodao.com.core.exceptions.TransactionIdNotFoundException;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Accessors(chain = true)
@Data(staticConstructor = "of")
public class ActProposalNearCliResponse {
	private String transactionHash;

	public static ActProposalNearCliResponse fillDto(List<String> output) {
		String transactionHash = output.stream().filter(p -> p.contains("Transaction Id")).findFirst()
				.orElseThrow(() -> new TransactionIdNotFoundException(String.join(System.lineSeparator(), output)))
				.split(" ")[2];

		return ActProposalNearCliResponse.of().setTransactionHash(transactionHash);
	}
}
