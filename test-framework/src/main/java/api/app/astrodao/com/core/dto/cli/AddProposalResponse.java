package api.app.astrodao.com.core.dto.cli;

import lombok.Data;

import java.util.List;

@Data(staticConstructor = "of")
public class AddProposalResponse {
    private String transactionHash;
    private String transactionUrl;
    private Integer id;

    public static AddProposalResponse fillDto(List<String> output) {
        AddProposalResponse addProposalResponse = AddProposalResponse.of();
        addProposalResponse.setId(Integer.valueOf(output.get(output.size() - 1)));
        addProposalResponse.setTransactionUrl(output.get(output.size() - 2));
        addProposalResponse.setTransactionHash(output.get(output.size() - 4).split(" ")[2]);
        return addProposalResponse;
    }
}
