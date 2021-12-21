package api.app.astrodao.com.core.dto.cli;

import lombok.Data;

import java.util.List;

@Data(staticConstructor = "of")
public class ActProposalNearCliResponse {
	private String transactionHash;

	public static ActProposalNearCliResponse fillDto(List<String> nearCliConsoleOutput) {
		ActProposalNearCliResponse actProposalNearCliResponse = ActProposalNearCliResponse.of();
		actProposalNearCliResponse.setTransactionHash(nearCliConsoleOutput.get(1).split(" ")[2]);

		return actProposalNearCliResponse;
	}
}
